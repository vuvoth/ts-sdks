// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { bcs, fromBase64 } from '@mysten/bcs';
import { SuiClient } from '@mysten/sui/client';
import type { Signer } from '@mysten/sui/cryptography';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { bls12381_min_pk_verify } from '@mysten/walrus-wasm';

import { TESTNET_WALRUS_PACKAGE_CONFIG } from './constants.js';
import { Blob } from './contracts/blob.js';
import { StakingInnerV1 } from './contracts/staking_inner.js';
import { StakingPool } from './contracts/staking_pool.js';
import { Staking } from './contracts/staking.js';
import { Storage } from './contracts/storage_resource.js';
import { SystemStateInnerV1 } from './contracts/system_state_inner.js';
import { init as initSystemContract, System } from './contracts/system.js';
import type {
	CertifyBlobOptions,
	GetSliverOptions,
	GetStorageConfirmationOptions,
	RegisterBlobOptions,
	SliversForNode,
	StorageNode,
	StorageWithSizeOptions,
	WalrusClientConfig,
	WalrusPackageConfig,
	WriteBlobOptions,
	WriteEncodedBlobOptions,
	WriteMetadataOptions,
	WriteSliverOptions,
	WriteSliversToNodeOptions,
} from './types.js';
import {
	blobIdToInt,
	BlobMetadata,
	BlobMetadataWithId,
	IntentType,
	SliverData,
	StorageConfirmation,
} from './utils/bcs.js';
import {
	encodedBlobLength,
	getPrimarySourceSymbols,
	getShardIndicesByNodeId,
	signersToBitmap,
	storageUnitsFromSize,
	toShardIndex,
} from './utils/index.js';
import { SuiObjectDataLoader } from './utils/object-loader.js';
import { TaskPool } from './utils/task-pool.js';
import { combineSignatures, decodePrimarySlivers, encodeBlob } from './wasm.js';

export class WalrusClient {
	packageConfig: WalrusPackageConfig;
	#suiClient: SuiClient;
	#objectLoader: SuiObjectDataLoader;
	#nodes?:
		| {
				byShardIndex: Map<number, StorageNode>;
				committee: StorageNode[];
		  }
		| Promise<{
				byShardIndex: Map<number, StorageNode>;
				committee: StorageNode[];
		  }>;

	constructor(config: WalrusClientConfig) {
		if (config.network && !config.packageConfig) {
			const network = config.network;
			switch (network) {
				case 'testnet':
					this.packageConfig = TESTNET_WALRUS_PACKAGE_CONFIG;
					break;
				default:
					throw new Error(`Unsupported network: ${network}`);
			}
		} else {
			this.packageConfig = config.packageConfig!;
		}

		this.#suiClient =
			config.suiClient ??
			new SuiClient({
				url: config.suiRpcUrl,
			});
		this.#objectLoader = new SuiObjectDataLoader(this.#suiClient);
	}

	get walType() {
		return `${this.packageConfig.walPackageId}::wal::WAL`;
	}

	get blobType() {
		return `${this.packageConfig.packageId}::blob::Blob`;
	}

	get storageType() {
		return `${this.packageConfig.packageId}::storage_resource::Storage`;
	}

	get systemContract() {
		return initSystemContract(this.packageConfig.packageId);
	}

	systemObject() {
		return this.#objectLoader.load(this.packageConfig.systemObjectId, System());
	}

	stakingObject() {
		return this.#objectLoader.load(this.packageConfig.stakingPoolId, Staking());
	}

	async systemState() {
		const systemState = await this.#objectLoader.loadFieldObject(
			this.packageConfig.systemObjectId,
			{ type: 'u64', value: (await this.stakingObject()).version },
			SystemStateInnerV1(),
		);

		return systemState;
	}

	async stakingState() {
		return this.#objectLoader.loadFieldObject(
			this.packageConfig.stakingPoolId,
			{
				type: 'u64',
				value: (await this.systemObject()).version,
			},
			StakingInnerV1(),
		);
	}

	async getBlobMetadata(blobId: string) {
		const res = await this.#fetchFromRandomNode(`/v1/blobs/${blobId}/metadata`, {
			method: 'GET',
		});

		return BlobMetadataWithId.parse(new Uint8Array(await res.arrayBuffer()));
	}

	async getSliver({ blobId, sliverPairIndex, sliverType = 'primary', signal }: GetSliverOptions) {
		const systemState = await this.systemState();
		const numShards = systemState.committee.n_shards;
		const shardIndex = toShardIndex(sliverPairIndex, blobId, numShards);

		const response = await this.#fetchFromShard(
			shardIndex,
			`/v1/blobs/${blobId}/slivers/${sliverPairIndex}/${sliverType}`,
			{
				method: 'GET',
				signal,
			},
		);

		return SliverData.parse(new Uint8Array(await response.arrayBuffer()));
	}

	async readBlob(blobId: string) {
		// TODO: calculate this using the unencoded_length and primary source symbols + other data
		const concurrencyLimit = 20;

		const systemState = await this.systemState();
		const numShards = systemState.committee.n_shards;
		const minSymbols = getPrimarySourceSymbols(numShards);

		const taskPool = new TaskPool(concurrencyLimit);
		const slivers: (typeof SliverData.$inferType)[] = [];
		const blobMetadata = await this.getBlobMetadata(blobId);

		// TODO: implement better shard selection logic
		const sliverPromises = new Array(numShards).fill(null).map((_, sliverPairIndex) =>
			taskPool
				.runTask((signal) => {
					return this.getSliver({ blobId, sliverPairIndex, signal }).then((response) => {
						slivers.push(response);

						if (slivers.length === minSymbols) {
							taskPool.abortPendingTasks();
						}
					});
				})
				.catch((error) => {
					// handle abort signal
					if (error.name === 'AbortError') {
						return;
					}

					throw error;
				}),
		);

		// TODO: implement retry/scheduling logic
		await Promise.allSettled(sliverPromises);

		if (slivers.length < minSymbols) {
			throw new Error('Not enough slivers to decode');
		}

		return decodePrimarySlivers(numShards, blobMetadata.metadata.V1.unencoded_length, slivers);
	}

	async createStorage({ size, epochs }: StorageWithSizeOptions) {
		const systemObject = await this.systemObject();
		const systemState = await this.systemState();
		const encodedSize = encodedBlobLength(size, systemState.committee.n_shards);

		return (tx: Transaction) => {
			const coin = tx.add(
				coinWithBalance({
					balance:
						BigInt(storageUnitsFromSize(encodedSize)) *
						BigInt(systemState.storage_price_per_unit_size) *
						BigInt(epochs),
					type: this.walType,
				}),
			);

			const storage = tx.add(
				this.systemContract.reserve_space({
					arguments: [systemObject.id.id, encodedSize, epochs, coin],
				}),
			);
			tx.moveCall({
				target: '0x2::coin::destroy_zero',
				typeArguments: [this.walType],
				arguments: [coin],
			});

			return storage;
		};
	}

	async createStorageTransaction({
		transaction = new Transaction(),
		size,
		epochs,
		owner,
	}: StorageWithSizeOptions & { transaction?: Transaction; owner: string }) {
		transaction.transferObjects([await this.createStorage({ size, epochs })], owner);

		return transaction;
	}

	async executeCreateStorageTransaction({
		signer,
		...options
	}: StorageWithSizeOptions & { transaction?: Transaction; signer: Signer }) {
		const transaction = await this.createStorageTransaction({
			...options,
			owner: options.transaction?.getData().sender ?? signer.toSuiAddress(),
		});

		const { digest, effects } = await this.#executeTransaction(
			transaction,
			signer,
			'create storage',
		);

		const createdObjectIds = effects?.created?.map((effect) => effect.reference.objectId) ?? [];

		const createdObjects = await this.#suiClient.multiGetObjects({
			ids: createdObjectIds,
			options: {
				showType: true,
				showBcs: true,
			},
		});

		const suiBlobObject = createdObjects.find((object) => object.data?.type === this.blobType);

		if (!suiBlobObject || suiBlobObject.data?.bcs?.dataType !== 'moveObject') {
			throw new Error('Storage object not found in transaction effects');
		}

		return {
			digest,
			blob: Storage().fromBase64(suiBlobObject.data.bcs.bcsBytes),
		};
	}

	async registerBlob({ size, epochs, blobId, rootHash, deletable }: RegisterBlobOptions) {
		const systemState = await this.systemState();
		const storage = await this.createStorage({ size, epochs });

		return (tx: Transaction) => {
			const encodedLength = encodedBlobLength(size, systemState.committee.n_shards);

			const writeCoin = tx.add(
				coinWithBalance({
					balance:
						BigInt(storageUnitsFromSize(encodedLength)) *
						BigInt(systemState.write_price_per_unit_size),
					type: this.walType,
				}),
			);

			const blob = tx.add(
				this.systemContract.register_blob({
					arguments: [
						tx.object(this.packageConfig.systemObjectId),
						storage,
						blobIdToInt(blobId),
						BigInt(bcs.u256().parse(rootHash)),
						size,
						0,
						deletable,
						writeCoin,
					],
				}),
			);

			tx.moveCall({
				target: '0x2::coin::destroy_zero',
				typeArguments: [this.walType],
				arguments: [writeCoin],
			});

			return blob;
		};
	}

	async registerBlobTransaction({
		transaction = new Transaction(),
		owner,
		...options
	}: RegisterBlobOptions & { transaction?: Transaction; owner: string }) {
		const registration = transaction.add(await this.registerBlob(options));

		transaction.transferObjects([registration], owner);

		return transaction;
	}

	async executeRegisterBlobTransaction({
		signer,
		...options
	}: RegisterBlobOptions & { transaction?: Transaction; signer: Signer }): Promise<{
		blob: ReturnType<typeof Blob>['$inferType'];
		digest: string;
	}> {
		const transaction = await this.registerBlobTransaction({
			...options,
			owner: options.transaction?.getData().sender ?? signer.toSuiAddress(),
		});

		const { digest, effects } = await this.#executeTransaction(
			transaction,
			signer,
			'register blob',
		);

		const createdObjectIds = effects?.created?.map((effect) => effect.reference.objectId) ?? [];

		const createdObjects = await this.#suiClient.multiGetObjects({
			ids: createdObjectIds,
			options: {
				showType: true,
				showBcs: true,
			},
		});

		const suiBlobObject = createdObjects.find((object) => object.data?.type === this.blobType);

		if (!suiBlobObject || suiBlobObject.data?.bcs?.dataType !== 'moveObject') {
			throw new Error('Blob object not found in transaction effects');
		}

		return {
			digest,
			blob: Blob().fromBase64(suiBlobObject.data.bcs.bcsBytes),
		};
	}

	async certifyBlob({ blobId, blobObjectId, confirmations }: CertifyBlobOptions) {
		const systemState = await this.systemState();
		const nodes = await this.#getNodes();

		if (confirmations.length !== systemState.committee.members.length) {
			throw new Error(
				'Invalid number of confirmations. Confirmations array must contain an entry for each node',
			);
		}

		const confirmationMessage = StorageConfirmation.serialize({
			intent: IntentType.BLOB_CERT_MSG,
			epoch: systemState.committee.epoch,
			messageContents: {
				blobId,
				blobType: {
					Permanent: null,
				},
			},
		}).toBase64();

		const filteredConfirmations = confirmations
			.map((confirmation, index) => {
				const isValid =
					confirmation?.serializedMessage === confirmationMessage &&
					bls12381_min_pk_verify(
						fromBase64(confirmation.signature),
						new Uint8Array(nodes.committee[index].info.public_key.bytes),
						fromBase64(confirmation.serializedMessage),
					);

				return isValid
					? {
							index,
							...confirmation,
						}
					: null;
			})
			.filter((confirmation) => confirmation !== null);

		const combinedSignature = combineSignatures(
			filteredConfirmations,
			filteredConfirmations.map(({ index }) => index),
		);

		return (tx: Transaction) => {
			this.systemContract.certify_blob({
				arguments: [
					tx.object(this.packageConfig.systemObjectId),
					tx.object(blobObjectId),
					tx.pure.vector('u8', fromBase64(combinedSignature.signature)),
					tx.pure.vector(
						'u8',
						signersToBitmap(combinedSignature.signers, systemState.committee.members.length),
					),
					tx.pure.vector('u8', combinedSignature.serializedMessage),
				],
			});
		};
	}

	async certifyBlobTransaction({
		transaction = new Transaction(),
		blobId,
		blobObjectId,
		confirmations,
	}: CertifyBlobOptions & {
		transaction?: Transaction;
	}) {
		transaction.add(await this.certifyBlob({ blobId, blobObjectId, confirmations }));

		return transaction;
	}

	async executeCertifyBlobTransaction({
		signer,
		...options
	}: CertifyBlobOptions & {
		transaction?: Transaction;
		signer: Signer;
	}) {
		const transaction = await this.certifyBlobTransaction(options);

		const { digest } = await this.#executeTransaction(transaction, signer, 'certify blob');

		return { digest };
	}

	async writeSliver({ blobId, sliverIndex, type, sliver, signal }: WriteSliverOptions) {
		const systemState = await this.systemState();
		const shardIndex = toShardIndex(sliverIndex, blobId, systemState.committee.n_shards);

		const response = await this.#fetchFromShard(
			shardIndex,
			`/v1/blobs/${blobId}/slivers/${sliverIndex}/${type}`,
			{
				body:
					typeof sliver === 'object' && 'symbols' in sliver
						? SliverData.serialize(sliver).toBytes()
						: sliver,
				method: 'PUT',
				headers: {
					'Content-Type': 'application/octet-stream',
				},
				signal,
			},
		);

		if (!response.ok) {
			throw new Error(`Failed to upload sliver: ${response.statusText}`);
		}

		await response.body?.cancel();
	}

	async writeMetadataToNode({ nodeIndex, blobId, metadata, signal }: WriteMetadataOptions) {
		const response = await this.#fetchFromNode(nodeIndex, `/v1/blobs/${blobId}/metadata`, {
			body:
				typeof metadata === 'object' && 'V1' in metadata
					? BlobMetadata.serialize(metadata).toBytes()
					: metadata,
			method: 'PUT',
			headers: {
				'Content-Type': 'application/octet-stream',
			},
			signal,
		});

		if (!response.ok) {
			throw new Error(`Failed to upload metadata: ${response.statusText}`);
		}

		await response.body?.cancel();
	}

	async getStorageConfirmationFromNode({
		nodeIndex,
		blobId,
		deletable,
		objectId,
	}: GetStorageConfirmationOptions) {
		const nodes = await this.#getNodes();
		const node = nodes.committee[nodeIndex];
		const res = await fetch(
			deletable
				? `https://${node.networkAddress}/v1/blobs/${blobId}/confirmation/deletable/${objectId}`
				: `https://${node.networkAddress}/v1/blobs/${blobId}/confirmation/permanent`,
			{
				method: 'GET',
			},
		);

		if (!res.ok) {
			throw new Error(
				`Failed to get storage confirmation from node ${node.networkAddress}: ${res.statusText}`,
			);
		}

		const json = (await res.json()) as {
			success: {
				data: {
					signed: {
						serializedMessage: string;
						signature: string;
					};
				};
			};
		};

		return json.success.data.signed;
	}

	async encodeBlob(blob: Uint8Array) {
		const systemState = await this.systemState();
		const { blobId, metadata, sliverPairs, rootHash } = encodeBlob(
			systemState.committee.n_shards,
			blob,
		);

		const sliversByNodeMap = new Map<number, SliversForNode>();

		while (sliverPairs.length > 0) {
			// remove from list so we don't preserve references to the original data
			const { primary, secondary } = sliverPairs.pop()!;

			const primaryShardIndex = toShardIndex(primary.index, blobId, systemState.committee.n_shards);
			const secondaryShardIndex = toShardIndex(
				secondary.index,
				blobId,
				systemState.committee.n_shards,
			);

			const primaryNode = await this.#getNodeByShardIndex(primaryShardIndex);
			const secondaryNode = await this.#getNodeByShardIndex(secondaryShardIndex);

			if (!sliversByNodeMap.has(primaryNode.nodeIndex)) {
				sliversByNodeMap.set(primaryNode.nodeIndex, { primary: [], secondary: [] });
			}

			if (!sliversByNodeMap.has(secondaryNode.nodeIndex)) {
				sliversByNodeMap.set(secondaryNode.nodeIndex, { primary: [], secondary: [] });
			}

			sliversByNodeMap.get(primaryNode.nodeIndex)!.primary.push({
				sliverIndex: primary.index,
				shardIndex: primaryShardIndex,
				sliver: SliverData.serialize(primary).toBytes(),
			});

			sliversByNodeMap.get(secondaryNode.nodeIndex)!.secondary.push({
				sliverIndex: secondary.index,
				shardIndex: secondaryShardIndex,
				sliver: SliverData.serialize(secondary).toBytes(),
			});
		}

		const sliversByNode = new Array<SliversForNode>();

		for (let i = 0; i < systemState.committee.members.length; i++) {
			sliversByNode.push(sliversByNodeMap.get(i) ?? { primary: [], secondary: [] });
		}

		return { blobId, metadata, rootHash, sliversByNode };
	}

	async writeSliversToNode({ blobId, slivers, signal }: WriteSliversToNodeOptions) {
		const controller = new AbortController();

		signal?.addEventListener('abort', () => {
			controller.abort();
		});

		await Promise.all(
			slivers.primary.map((sliver) =>
				this.writeSliver({
					blobId,
					sliverIndex: sliver.sliverIndex,
					type: 'primary',
					sliver: sliver.sliver,
					signal: controller.signal,
				}),
			),
		).catch((error) => {
			controller.abort();
			throw error;
		});
	}

	async writeEncodedBlobToNode({
		nodeIndex,
		blobId,
		metadata,
		slivers,
		signal,
		...options
	}: WriteEncodedBlobOptions) {
		await this.writeMetadataToNode({
			nodeIndex,
			blobId,
			metadata,
			signal,
		});

		await this.writeSliversToNode({ blobId, slivers, signal, nodeIndex });

		return this.getStorageConfirmationFromNode({
			nodeIndex,
			blobId,
			...options,
		});
	}

	async writeBlob({ blob, deletable, epochs, signer, signal }: WriteBlobOptions) {
		const systemState = await this.systemState();
		const nodes = await this.#getNodes();
		const controller = new AbortController();

		signal?.addEventListener('abort', () => {
			controller.abort();
		});

		const { sliversByNode, blobId, metadata, rootHash } = await this.encodeBlob(blob);

		const suiBlobObject = await this.executeRegisterBlobTransaction({
			signer,
			size: blob.length,
			epochs,
			blobId,
			rootHash,
			deletable,
		});

		const blobObjectId = suiBlobObject.blob.id.id;

		const maxFaulty = Math.floor((systemState.committee.n_shards - 1) / 3);
		let failures = 0;

		const confirmations = await Promise.all(
			sliversByNode.map((slivers, nodeIndex) =>
				this.writeEncodedBlobToNode({
					blobId,
					nodeIndex,
					metadata,
					slivers,
					deletable: false,
					signal: controller.signal,
				}).catch(() => {
					failures += nodes.committee[nodeIndex].shardIndices.length;

					if (failures > maxFaulty) {
						controller.abort();

						throw new Error(`Too many failures while writing blob ${blobId} to nodes`);
					}

					return null;
				}),
			),
		);

		await this.executeCertifyBlobTransaction({
			signer,
			blobId,
			blobObjectId,
			confirmations,
		});

		return { blobId, blobObjectId };
	}

	async #executeTransaction(transaction: Transaction, signer: Signer, action: string) {
		const { digest, effects } = await this.#suiClient.signAndExecuteTransaction({
			transaction,
			signer,
			options: {
				showEffects: true,
			},
		});

		if (effects?.status.status !== 'success') {
			throw new Error(`Failed to ${action}: ${effects?.status.error}`);
		}

		await this.#suiClient.waitForTransaction({
			digest,
		});

		return { digest, effects };
	}

	async #getNodesWithoutCache() {
		const nodes = await this.#stakingPool();
		const shardIndicesByNodeId = getShardIndicesByNodeId((await this.stakingState()).committee);
		const byShardIndex = new Map<number, StorageNode>();
		const committee = nodes.map(({ node_info }, nodeIndex) => {
			const shardIndices = shardIndicesByNodeId.get(node_info.node_id) ?? [];
			const node: StorageNode = {
				id: node_info.node_id,
				info: node_info,
				networkAddress: node_info.network_address,
				shardIndices,
				nodeIndex,
			};

			for (const shardIndex of shardIndices) {
				byShardIndex.set(shardIndex, node);
			}

			return node;
		});

		return {
			byShardIndex,
			committee,
		};
	}

	async #getNodes() {
		if (!this.#nodes) {
			this.#nodes = this.#getNodesWithoutCache();
			this.#nodes = await this.#nodes;
		}

		return this.#nodes;
	}

	async #stakingPool() {
		return this.#objectLoader.loadManyOrThrow(
			(await this.systemState()).committee.members.map((member) => member.node_id),
			StakingPool(),
		);
	}

	async #fetchFromNode(index: number, path: string, init: RequestInit) {
		const node = (await this.#getNodes()).committee[index];

		const response = await fetch(`https://${node.networkAddress}${path}`, init);

		if (!response.ok) {
			throw new Error(`Failed to fetch from node ${node.networkAddress}: ${response.statusText}`);
		}

		return response;
	}

	async #getNodeByShardIndex(index: number) {
		const nodes = await this.#getNodes();
		const node = nodes.byShardIndex.get(index);

		if (!node) {
			throw new Error(`Node for shard index ${index} not found`);
		}

		return node;
	}

	async #fetchFromShard(index: number, path: string, init: RequestInit) {
		const node = await this.#getNodeByShardIndex(index);

		const response = await fetch(`https://${node.networkAddress}${path}`, init);

		if (!response.ok) {
			throw new Error(`Failed to fetch from node ${node.networkAddress}: ${response.statusText}`);
		}

		return response;
	}

	async #fetchFromRandomNode(path: string, init: RequestInit) {
		const nodes = await this.#getNodes();

		const nodeIndex = Math.floor(Math.random() * nodes.committee.length);

		return this.#fetchFromNode(nodeIndex, path, init);
	}
}
