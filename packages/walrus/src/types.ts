// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { SuiClient } from '@mysten/sui/client';
import type { Signer } from '@mysten/sui/cryptography';

import type { StorageNodeInfo } from './contracts/storage_node.js';
import type { SliverType } from './node-api/types.gen.js';
import type { BlobMetadata, SliverData } from './utils/bcs.js';

export interface WalrusPackageConfig {
	packageId: string;
	systemObjectId: string;
	stakingPoolId: string;
	walPackageId: string;
	exchange?: {
		packageId: string;
		exchangeIds: string[];
	};
}

type SuiClientOrRpcUrl =
	| {
			suiClient: SuiClient;
			suiRpcUrl?: never;
	  }
	| {
			suiRpcUrl: string;
			suiClient?: never;
	  };

type WalrusNetworkOrPackageConfig =
	| {
			network: 'testnet';
			packageConfig?: WalrusPackageConfig;
	  }
	| {
			network?: never;
			packageConfig: WalrusPackageConfig;
	  };

export type WalrusClientConfig = WalrusNetworkOrPackageConfig & SuiClientOrRpcUrl;

export interface StorageNode {
	networkAddress: string;
	info: ReturnType<typeof StorageNodeInfo>['$inferType'];
	shardIndices: number[];
	nodeIndex: number;
	id: string;
}

export interface GetSliverOptions {
	blobId: string;
	sliverPairIndex: number;
	sliverType?: SliverType;
	signal?: AbortSignal;
}

export interface StorageWithSizeOptions {
	size: number;
	epochs: number;
}

export interface RegisterBlobOptions extends StorageWithSizeOptions {
	blobId: string;
	rootHash: Uint8Array;
	deletable: boolean;
}

export interface CertifyBlobOptions {
	blobId: string;
	blobObjectId: string;
	confirmations: ({
		serializedMessage: string;
		signature: string;
	} | null)[];
}

export interface WriteSliverOptions {
	blobId: string;
	sliverIndex: number;
	type: SliverType;
	sliver: typeof SliverData.$inferInput | BodyInit;
	signal?: AbortSignal;
}

export interface WriteMetadataOptions {
	nodeIndex: number;
	blobId: string;
	metadata: BodyInit | typeof BlobMetadata.$inferInput;
	signal?: AbortSignal;
}

export interface StorageConfirmation {
	serializedMessage: string;
	signature: string;
}

type DeletableConfirmationOptions =
	| { deletable: false; objectId?: string }
	| { deletable: true; objectId: string };

export type GetStorageConfirmationOptions = {
	blobId: string;
	nodeIndex: number;
} & DeletableConfirmationOptions;

export interface SliversForNode {
	primary: { sliverIndex: number; shardIndex: number; sliver: Uint8Array }[];
	secondary: { sliverIndex: number; shardIndex: number; sliver: Uint8Array }[];
}

export interface WriteSliversToNodeOptions {
	blobId: string;
	nodeIndex: number;
	slivers: SliversForNode;
	signal?: AbortSignal;
}

export type WriteEncodedBlobOptions = {
	blobId: string;
	nodeIndex: number;
	metadata: BodyInit | typeof BlobMetadata.$inferInput;
	slivers: SliversForNode;
	signal?: AbortSignal;
} & DeletableConfirmationOptions;

export interface WriteBlobOptions {
	blob: Uint8Array;
	deletable: boolean;
	signal?: AbortSignal;
	epochs: number;
	signer: Signer;
}

export interface DeleteBlobOptions {
	blobObjectId: string;
}

export type ExtendBlobOptions = {
	blobObjectId: string;
} & (
	| {
			epochs: number;
			endEpoch?: never;
	  }
	| {
			endEpoch: number;
			epochs?: never;
	  }
);
