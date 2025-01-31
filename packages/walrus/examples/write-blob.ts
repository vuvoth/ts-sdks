// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui/faucet';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI } from '@mysten/sui/utils';

import { WalrusClient } from '../src/client.js';
import { TaskPool } from '../src/utils/task-pool.js';
import { encodeBlob } from '../src/wasm.js';

/** @ts-ignore */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const suiClient = new SuiClient({
	url: getFullnodeUrl('testnet'),
});

const walrusClient = new WalrusClient({
	network: 'testnet',
	suiClient,
});

async function uploadFile() {
	const keypair = await getFundedKeypair();
	const systemState = await walrusClient.systemState();

	const file = new TextEncoder().encode('Hello from the TS SDK!!!\n');

	const {
		sliverPairs,
		metadata: { metadata, blob_id: blobId },
		rootHash,
	} = encodeBlob(systemState.committee.n_shards, file);

	const suiBlobObject = await walrusClient.executeRegisterBlobTransaction({
		signer: keypair,
		size: file.length,
		epochs: 3,
		blobId,
		rootHash,
		deletable: false,
	});

	const taskPool = new TaskPool(100);

	for (const [nodeIndex] of systemState.committee.members.entries()) {
		taskPool.runTask(() => {
			return walrusClient
				.writeMetadataToNode({
					blobId,
					nodeIndex,
					metadata,
				})
				.then(async (res) => {})
				.catch((err) => {
					console.error(err);
				});
		});
	}

	await taskPool.awaitAll();

	for (const sliver of sliverPairs) {
		taskPool.runTask(() =>
			walrusClient
				.writeSliver({
					sliver: sliver.primary,
					type: 'primary',
					blobId,
					sliverIndex: sliver.primary.index,
				})
				.catch((err) => {
					console.error(err);
				}),
		);

		taskPool
			.runTask(() =>
				walrusClient.writeSliver({
					sliver: sliver.secondary,
					type: 'secondary',
					blobId,
					sliverIndex: sliver.secondary.index,
				}),
			)

			.catch((err) => {
				console.error(err);
			});
	}

	await taskPool.awaitAll();

	await console.log('finished uploading shards');

	const confirmations = await Promise.all(
		systemState.committee.members.map(
			async (
				_node,
				nodeIndex,
			): Promise<{
				serializedMessage: string;
				signature: string;
			} | null> => {
				const res = await taskPool.runTask(async () => {
					try {
						return await walrusClient.getStorageConfirmationFromNode({
							nodeIndex,
							blobId,
							deletable: false,
							objectId: suiBlobObject.blob.id.id,
						});
					} catch (err) {
						console.error(err);
						return null;
					}
				});

				return res;
			},
		),
	);

	await walrusClient.executeCertifyBlobTransaction({
		signer: keypair,
		blobId,
		blobObjectId: suiBlobObject.blob.id.id,
		confirmations,
	});

	console.log(blobId);
}

uploadFile();

async function getFundedKeypair() {
	const keypair = Ed25519Keypair.fromSecretKey(
		'suiprivkey1qzmcxscyglnl9hnq82crqsuns0q33frkseks5jw0fye3tuh83l7e6ajfhxx',
	);
	console.log(keypair.toSuiAddress());

	const balance = await suiClient.getBalance({
		owner: keypair.toSuiAddress(),
	});

	if (BigInt(balance.totalBalance) < MIST_PER_SUI) {
		await requestSuiFromFaucetV0({
			host: getFaucetHost('testnet'),
			recipient: keypair.toSuiAddress(),
		});
	}

	const walBalance = await suiClient.getBalance({
		owner: keypair.toSuiAddress(),
		coinType: walrusClient.walType,
	});
	console.log('wal balance:', walBalance.totalBalance);

	if (Number(walBalance.totalBalance) < Number(MIST_PER_SUI) / 2) {
		const tx = new Transaction();

		const wal = tx.moveCall({
			package: walrusClient.packageConfig.exchange!.packageId,
			module: 'wal_exchange',
			function: 'exchange_all_for_wal',
			arguments: [
				tx.object(walrusClient.packageConfig.exchange!.exchangeIds[0]),
				coinWithBalance({
					balance: MIST_PER_SUI / 2n,
				}),
			],
		});

		tx.transferObjects([wal], keypair.toSuiAddress());

		const { digest } = await suiClient.signAndExecuteTransaction({
			transaction: tx,
			signer: keypair,
		});

		await suiClient.waitForTransaction({
			digest,
			options: {
				showEvents: true,
			},
		});
	}

	return keypair;
}
