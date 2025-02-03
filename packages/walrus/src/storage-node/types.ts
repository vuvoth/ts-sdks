// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { BlobMetadata, BlobMetadataWithId, SliverData } from '../utils/bcs.js';

export type BlobMetadataWithId = typeof BlobMetadataWithId.$inferType;

export type SliverType = 'primary' | 'secondary';

export type SliverData = typeof SliverData.$inferType;

export type Uploadable = Uint8Array | ArrayBuffer | ReadableStream | Blob;

export type StorageConfirmation = {
	serializedMessage: string;
	signature: string;
};

export type GetBlobMetadataRequestInput = {
	blobId: string;
};

export type GetBlobMetadataResponse = BlobMetadataWithId;

export type StoreBlobMetadataRequestInput = {
	blobId: string;
	metadata: Uploadable | typeof BlobMetadata.$inferInput;
};

export type StoreBlobMetadataResponse = void;

export type GetSliverRequestInput = {
	blobId: string;
	sliverType: SliverType;
	sliverPairIndex: number;
};
export type GetSliverResponse = SliverData;

export type StoreSliverRequestInput = {
	blobId: string;
	sliver: Uploadable | typeof SliverData.$inferInput;
	sliverType: SliverType;
	sliverPairIndex: number;
};
export type StoreSliverResponse = void;

export type GetDeletableBlobConfirmationRequestInput = {
	blobId: string;
	objectId: string;
};

export type GetDeletableBlobConfirmationResponse = StorageConfirmation;

export type GetPermanentBlobConfirmationRequestInput = {
	blobId: string;
};

export type GetPermanentBlobConfirmationResponse = StorageConfirmation;
