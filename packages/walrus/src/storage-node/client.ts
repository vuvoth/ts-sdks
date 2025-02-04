// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { BlobMetadata, BlobMetadataWithId, SliverData } from '../utils/bcs.js';
import { StorageNodeAPIError, UserAbortError } from './error.js';
import type {
	GetBlobMetadataRequestInput,
	GetBlobMetadataResponse,
	GetDeletableBlobConfirmationRequestInput,
	GetDeletableBlobConfirmationResponse,
	GetPermanentBlobConfirmationRequestInput,
	GetPermanentBlobConfirmationResponse,
	GetSliverRequestInput,
	GetSliverResponse,
	StoreBlobMetadataRequestInput,
	StoreBlobMetadataResponse,
	StoreSliverRequestInput,
	StoreSliverResponse,
} from './types.js';
import { mergeHeaders } from './utils.js';

export type Fetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

export type StorageNodeClientOptions = {
	/**
	 * An optional custom fetch function.
	 *
	 * If not provided, defaults to the global `fetch` function (`globalThis.fetch`).
	 *
	 * @default globalThis.fetch
	 */
	fetch?: Fetch;
};

export type RequestOptions = {
	nodeUrl: string;
	headers: ReturnType<typeof mergeHeaders>;
} & Omit<RequestInit, 'body' | 'headers'>;

export class StorageNodeClient {
	#fetch: Fetch;

	constructor({ fetch: overriddenFetch }: StorageNodeClientOptions = {}) {
		this.#fetch = overriddenFetch ?? globalThis.fetch;
	}

	/**
	 * Gets the metadata associated with a Walrus blob.
	 */
	async getBlobMetadata(
		{ blobId }: GetBlobMetadataRequestInput,
		{ nodeUrl, ...options }: RequestOptions,
	): Promise<GetBlobMetadataResponse> {
		const response = await this.#request(`${nodeUrl}/v1/blobs/${blobId}/metadata`, {
			...options,
			headers: mergeHeaders({ Accept: 'application/octet-stream' }, options.headers),
		});

		const bcsBytes = await response.arrayBuffer();
		return BlobMetadataWithId.parse(new Uint8Array(bcsBytes));
	}

	/**
	 * Stores the metadata associated with a registered Walrus blob at this storage
	 * node. This is a pre-requisite for storing the encoded slivers of the blob. The
	 * ID of the blob must first be registered on Sui, after which storing the metadata
	 * becomes possible.
	 *
	 * This endpoint may return an error if the node has not yet received the
	 * registration event from the chain.
	 */
	async storeBlobMetadata(
		{ blobId, metadata }: StoreBlobMetadataRequestInput,
		{ nodeUrl, ...options }: RequestOptions,
	): Promise<StoreBlobMetadataResponse> {
		const isBcsInput = typeof metadata === 'object' && 'V1' in metadata;
		const body = isBcsInput ? BlobMetadata.serialize(metadata).toBytes() : metadata;

		const response = await this.#request(`${nodeUrl}/v1/blobs/${blobId}/metadata`, {
			...options,
			method: 'PUT',
			body,
			headers: mergeHeaders({ 'Content-Type': 'application/octet-stream' }, options.headers),
		});

		const json = await response.json();
		return json;
	}

	/**
	 * Gets the primary or secondary sliver identified by the specified blob ID and
	 * index. The index should represent a sliver that is assigned to be stored at one
	 * of the shards managed by this storage node during this epoch.
	 */
	async getSliver(
		{ blobId, sliverPairIndex, sliverType }: GetSliverRequestInput,
		{ nodeUrl, ...options }: RequestOptions,
	): Promise<GetSliverResponse> {
		const response = await this.#request(
			`${nodeUrl}/v1/blobs/${blobId}/slivers/${sliverPairIndex}/${sliverType}`,
			{
				...options,
				headers: mergeHeaders({ Accept: 'application/octet-stream' }, options.headers),
			},
		);

		const bcsBytes = await response.arrayBuffer();
		return SliverData.parse(new Uint8Array(bcsBytes));
	}

	/**
	 * Stores a primary or secondary blob sliver at the storage node.
	 */
	async storeSliver(
		{ blobId, sliverPairIndex, sliverType, sliver }: StoreSliverRequestInput,
		{ nodeUrl, ...options }: RequestOptions,
	): Promise<StoreSliverResponse> {
		const isBcsInput = typeof sliver === 'object' && 'symbols' in sliver;
		const body = isBcsInput ? SliverData.serialize(sliver).toBytes() : sliver;

		const response = await this.#request(
			`${nodeUrl}/v1/blobs/${blobId}/slivers/${sliverPairIndex}/${sliverType}`,
			{
				...options,
				method: 'PUT',
				body,
				headers: mergeHeaders({ 'Content-Type': 'application/octet-stream' }, options.headers),
			},
		);

		const json = await response.json();
		return json;
	}

	/**
	 * Gets a signed storage confirmation from this storage node, indicating that all shards
	 * assigned to this storage node for the current epoch have stored their respective slivers.
	 */
	async getDeletableBlobConfirmation(
		{ blobId, objectId }: GetDeletableBlobConfirmationRequestInput,
		{ nodeUrl, ...options }: RequestOptions,
	): Promise<GetDeletableBlobConfirmationResponse> {
		const response = await this.#request(
			`${nodeUrl}/v1/blobs/${blobId}/confirmation/deletable/${objectId}`,
			options,
		);

		const json = await response.json();
		return json;
	}

	/**
	 * Gets a signed storage confirmation from this storage node, indicating that all shards
	 * assigned to this storage node for the current epoch have stored their respective slivers.
	 */
	async getPermanentBlobConfirmation(
		{ blobId }: GetPermanentBlobConfirmationRequestInput,
		{ nodeUrl, ...options }: RequestOptions,
	): Promise<GetPermanentBlobConfirmationResponse> {
		const response = await this.#request(
			`${nodeUrl}/v1/blobs/${blobId}/confirmation/permanent`,
			options,
		);

		const json = await response.json();
		return json;
	}

	async #request(url: string, init: RequestInit) {
		const response = await this.#fetch(url, init).catch((error) => {
			if (init.signal?.aborted) {
				throw new UserAbortError();
			}
			throw error;
		});

		if (!response.ok) {
			const errorText = await response.text().catch((reason) => reason);
			const errorJSON = safeParseJSON(errorText);
			const errorMessage = errorJSON ? undefined : errorText;
			throw StorageNodeAPIError.generate(response.status, errorJSON, errorMessage);
		}

		return response;
	}
}

function safeParseJSON(value: string) {
	try {
		return JSON.parse(value);
	} catch {
		return undefined;
	}
}
