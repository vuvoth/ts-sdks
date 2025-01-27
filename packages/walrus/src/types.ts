// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { SuiClient } from '@mysten/sui/client';

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
}

export interface WriteMetadataOptions {
	nodeIndex: number;
	blobId: string;
	metadata: BodyInit | typeof BlobMetadata.$inferInput;
}

export interface StorageConfirmation {
	serializedMessage: string;
	signature: string;
}

export type GetStorageConfirmationOptions = {
	blobId: string;
	nodeIndex: number;
} & ({ deletable: false; objectId?: string } | { deletable: true; objectId: string });
