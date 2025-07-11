// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Agent, setGlobalDispatcher } from 'undici';

import { WalrusClient } from '../../src/client.js';
import { getFundedKeypair } from '../funded-keypair.js';
import { encodeQuilt } from '../../src/quilt/write.js';
import { urlSafeBase64 } from '../../src/utils/index.js';
import { QuiltPatchId } from '../../src/utils/bcs.js';

// Node connect timeout is 10 seconds, and walrus nodes can be slow to respond
setGlobalDispatcher(
	new Agent({
		connectTimeout: 60_000,
		connect: { timeout: 60_000 },
	}),
);

const client = new SuiClient({
	url: getFullnodeUrl('testnet'),
	network: 'testnet',
}).$extend(
	WalrusClient.experimental_asClientExtension({
		storageNodeClientOptions: {
			timeout: 60_000,
		},
	}),
);

async function uploadFile() {
	const keypair = await getFundedKeypair();

	const encoded = encodeQuilt({
		blobs: [
			{
				contents: new TextEncoder().encode('test 1'),
				identifier: 'test1',
				tags: {
					a: 'a',
					aa: 'aa',
					b: 'b',
				},
			},
			{
				contents: new TextEncoder().encode('test 2'),
				identifier: 'test2',
			},
		],
		numShards: 1000,
	});

	const { blobId } = await client.walrus.writeBlob({
		blob: encoded.quilt,
		deletable: true,
		epochs: 3,
		signer: keypair,
	});

	const index = encoded.index.patches.map((patch) => ({
		...patch,
		patchId: urlSafeBase64(
			QuiltPatchId.serialize({
				quiltId: blobId,
				patchId: {
					version: 1,
					startIndex: patch.startIndex,
					endIndex: patch.endIndex,
				},
			}).toBytes(),
		),
	}));

	console.log(blobId, index);
}

uploadFile().catch(console.error);
