// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { serve } from '@hono/node-server';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Hono } from 'hono';

import { WalrusClient } from '../src/index.js';

/** @ts-ignore */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = new Hono();

const suiClient = new SuiClient({
	url: getFullnodeUrl('testnet'),
});

const walrusClient = new WalrusClient({
	network: 'testnet',
	suiClient,
});

const cache = new Map<string, Blob>();

app.get('/v1/blobs/:id', async (c) => {
	const blobId = c.req.param('id');

	if (!cache.has(blobId)) {
		// TODO: handle not found error
		const blob = await walrusClient.readBlob({ blobId });
		cache.set(blobId, new Blob([blob]));
	}

	return c.body(cache.get(blobId)!.stream());
});

serve(app, (info) => {
	console.log(`Server is running on http://127.0.0.1:${info.port}`);
});
