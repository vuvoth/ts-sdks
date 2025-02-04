// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { fromBase64, toBase64, toHex } from '@mysten/bcs';
import { combine } from 'shamir-secret-sharing';

import { AesGcm256 } from './aes.js';
import { G1Element, G2Element } from './bls12381.js';
import { elgamal_decrypt, toPublicKey } from './elgamal.js';
import { BonehFranklinBLS12381Services, DST } from './ibe.js';
import type { KeyServer } from './key-server.js';
import type { Certificate, SessionKey } from './session-key.js';
import type { EncryptedObject } from './types.js';
import { createFullId } from './utils.js';

export class KeyStore {
	// A caching map for: fullId -> a list of keys from different servers.
	private readonly keys_map: Map<string, Uint8Array>;

	constructor() {
		this.keys_map = new Map();
	}

	// TODO: This is only used for tests
	public addKey(fullId: string, objectId: Uint8Array, key: Uint8Array) {
		this.keys_map.set(fullId + ':' + toHex(objectId), key);
	}

	public getKey(fullId: string, objectId: Uint8Array): Uint8Array | undefined {
		return this.keys_map.get(fullId + ':' + toHex(objectId));
	}

	public hasKey(fullId: string, objectId: Uint8Array): boolean {
		return this.keys_map.has(fullId + ':' + toHex(objectId));
	}

	/** Look up URLs of key servers and fetch key from servers with request signature,
	 * cert and ephPk, then updates the caching keys_map.
	 */
	async fetchKeys({
		keyServers,
		threshold,
		packageId,
		ids,
		txBytes,
		sessionKey,
	}: {
		keyServers: KeyServer[];
		threshold: number;
		packageId: Uint8Array;
		ids: Uint8Array[];
		txBytes: Uint8Array;
		sessionKey: SessionKey;
	}) {
		// TODO: support multiple ids.
		if (ids.length !== 1) {
			throw new Error('Only one ID is supported');
		}
		const fullIdHex = toHex(createFullId(DST, packageId, ids[0]));
		const remainingKeyServers = keyServers.filter((ks) => !this.hasKey(fullIdHex, ks.objectId));
		if (remainingKeyServers.length === 0) {
			return;
		}

		const cert = sessionKey.getCertificate();
		const signedRequest = await sessionKey.createRequestParams(txBytes);

		// TODO: wait for t completed promises (not failures).
		console.log('threshold', threshold);
		await Promise.all(
			remainingKeyServers.map(async (server) => {
				const res = await fetchKey(
					server.url,
					signedRequest.request_signature,
					txBytes,
					signedRequest.decryption_key,
					cert,
				);
				// TODO: verify the response (BLS verify)
				// TODO check that the id is consistent with the fullId
				this.addKey(fullIdHex, server.objectId, res.key);
			}),
		);
	}

	/**
	 * Decrypt the given encrypted bytes with the given cached secret keys for the full ID.
	 *
	 * @param encryptedObject - EncryptedObject.
	 * @param sks - The secret keys. It's assumed that these keys are validated. Otherwise the KEM may give a wrong result.
	 * @returns - The decrypted plaintext corresponding to ciphertext.
	 */
	async decrypt(encryptedObject: typeof EncryptedObject.$inferType): Promise<Uint8Array> {
		const fullId = toHex(
			createFullId(DST, encryptedObject.package_id, new Uint8Array(encryptedObject.inner_id)),
		);
		// Get secret keys for the fullId/services map.
		const services = encryptedObject.services.map((service: [Uint8Array, number]) => service[0]);
		const services_in_key_store = services.filter((serviceId) => this.hasKey(fullId, serviceId));

		if (services_in_key_store.length < encryptedObject.threshold) {
			throw new Error('Not enough shares. Please fetch more keys.');
		}
		const user_secret_keys = services_in_key_store.map((serviceId) =>
			G1Element.fromBytes(this.getKey(fullId, serviceId)!),
		);

		const nonce = G2Element.fromBytes(
			encryptedObject.encrypted_shares.BonehFranklinBLS12381.encapsulation,
		);
		const encrypted_shares = encryptedObject.encrypted_shares.BonehFranklinBLS12381.shares;

		if (
			encrypted_shares.length === 0 ||
			encrypted_shares.length !== user_secret_keys.length ||
			encrypted_shares.length < encryptedObject.threshold
		) {
			throw new Error('Invalid input');
		}

		// Decrypt each share.
		const shares = encrypted_shares.map((encrypted_share: Uint8Array, i: number) => {
			const index = encryptedObject.services[i][1];
			let decrypted_share;
			if (encryptedObject.encrypted_shares.BonehFranklinBLS12381) {
				// Use the index as the unique info parameter to allow for multiple shares per key server.
				const info = new Uint8Array([index]);
				decrypted_share = BonehFranklinBLS12381Services.decrypt(
					nonce,
					user_secret_keys[i],
					encrypted_share,
					info,
				);
			} else {
				throw new Error('Invalid encrypted object');
			}
			const share = new Uint8Array(decrypted_share.length + 1);
			share.set(decrypted_share, 0);

			// The Shamir secret sharing library expects the index/x-coordinate to be at the end of the share.
			share[decrypted_share.length] = index;
			return share;
		});

		// Combine the decrypted shares into the key.
		const key = shares.length === 1 ? shares[0].subarray(0, 32) : await combine(shares);

		if (encryptedObject.ciphertext.Aes256Gcm) {
			try {
				// Decrypt the ciphertext with the key.
				return AesGcm256.decrypt(key, encryptedObject.ciphertext);
			} catch {
				throw new Error('Decryption failed');
			}
		} else if (encryptedObject.ciphertext.Plain) {
			// In case `Plain` mode is used, return the key.
			return key;
		} else {
			throw new Error('Invalid encrypted object');
		}
	}
}

/**
 * Helper function to request a Seal key from URL with requestSig, txBytes, ephemeral pubkey.
 * Then decrypt the Seal key with ephemeral secret key.
 */
async function fetchKey(
	url: string,
	requestSig: string,
	txBytes: Uint8Array,
	enc_key: Uint8Array,
	certificate: Certificate,
): Promise<{ fullId: Uint8Array; key: Uint8Array }> {
	const enc_key_pk = toPublicKey(enc_key);
	const body = {
		ptb: toBase64(txBytes.slice(1)),
		enc_key: toBase64(enc_key_pk),
		request_signature: requestSig,
		certificate,
	};
	const response = await fetch(url + '/v1/fetch_key', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	const resp = await response.json();
	// TODO: handle multiple decryption keys.
	const key = elgamal_decrypt(
		enc_key,
		resp.decryption_keys[0].encrypted_key.map((k: string) => fromBase64(k)),
	);
	return {
		fullId: resp.decryption_keys[0].fullId,
		key,
	};
}
