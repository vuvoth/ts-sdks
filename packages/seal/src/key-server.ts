// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { fromBase64, fromHex, toHex } from '@mysten/bcs';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { bls12_381 } from '@noble/curves/bls12-381';

import { DST_POP } from './ibe.js';

export type KeyServer = {
	objectId: Uint8Array;
	name: string;
	url: string;
	keyType: KeyServerType;
	pk: Uint8Array;
};

export enum KeyServerType {
	BonehFranklinBLS12381 = 0,
}

/**
 * Returns a static list of Seal key server object ids that the dapp can choose to use.
 * @param network - The network to use.
 * @returns The object id's of the key servers.
 */
export function getAllowlistedKeyServers(network: 'testnet' | 'mainnet'): Uint8Array[] {
	if (network === 'testnet') {
		return [
			fromHex('0xb35a7228d8cf224ad1e828c0217c95a5153bafc2906d6f9c178197dce26fbcf8'),
			fromHex('0x2d6cde8a9d9a65bde3b0a346566945a63b4bfb70e9a06c41bdb70807e2502b06'),
		];
	} else {
		throw new Error('Network not supported');
	}
}

/**
 * Given a list of key server object IDs, returns a list of SealKeyServer
 * from onchain state containing name, objectId, URL and pk.
 *
 * @param objectIds - The key server object IDs.
 * @returns - An array of SealKeyServer.
 */
export async function retrieveKeyServers({
	objectIds,
	client = new SuiClient({ url: getFullnodeUrl('testnet') }),
}: {
	objectIds: Uint8Array[];
	client?: SuiClient;
}): Promise<KeyServer[]> {
	return await Promise.all(
		objectIds.map(async (objectId) => {
			const res = await client.getObject({
				id: toHex(objectId),
				options: {
					showContent: true,
				},
			});
			if (!res?.data) throw new Error('No data returned from client');
			const fields = (res?.data?.content as { fields: { [k: string]: any } })?.fields;

			if (fields.key_type !== 0) {
				throw new Error('Key type is not supported');
			}
			const keyType = KeyServerType.BonehFranklinBLS12381;
			const pk = new Uint8Array(fields.pk);

			return {
				objectId,
				name: fields.name,
				url: fields.url,
				keyType,
				pk,
			};
		}),
	);
}

/**
 * Given a KeyServer, fetch the proof of possesion (PoP) from the URL and verify it
 * against the pubkey. This should be used only rarely when the dapp uses a dynamic
 * set of key servers.
 *
 * @param server - The KeyServer to verify.
 * @returns - True if the key server is valid, false otherwise.
 */
export async function verifyKeyServer(server: KeyServer): Promise<boolean> {
	const response = await fetch(server.url! + '/v1/service', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const serviceResponse = await response.json();

	if (serviceResponse.service_id !== server.objectId) {
		return false;
	}
	const fullMsg = new Uint8Array([...DST_POP, ...server.pk, ...server.objectId]);
	if (!bls12_381.verifyShortSignature(fromBase64(serviceResponse.pop), fullMsg, server.pk)) {
		return false;
	}
	return true;
}
