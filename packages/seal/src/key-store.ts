// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { fromBase64, toBase64, toHex } from '@mysten/bcs';
import { combine } from 'shamir-secret-sharing';

import { AesGcm256 } from './aes.js';
import { G1Element, G2Element } from './bls12381.js';
import { elgamalDecrypt, toPublicKey } from './elgamal.js';
import { BonehFranklinBLS12381Services, DST } from './ibe.js';
import type { KeyServer } from './key-server.js';
import { KeyServerType } from './key-server.js';
import type { Certificate, SessionKey } from './session-key.js';
import type { EncryptedObject } from './types.js';
import { createFullId } from './utils.js';

// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
/**
 * A class to cache user secret keys after they have been fetched from key servers.
 */
export class KeyStore {
	// A caching map for: fullId -> a list of keys from different servers.
	private readonly keys_map: Map<string, G1Element>;

	constructor() {
		this.keys_map = new Map();
	}

	private createMapKey(fullId: Uint8Array, objectId: Uint8Array): string {
		return toHex(fullId) + ':' + toHex(objectId);
	}

	// TODO: This is only used for tests
	public addKey(fullId: Uint8Array, objectId: Uint8Array, key: G1Element) {
		this.keys_map.set(this.createMapKey(fullId, objectId), key);
	}

	/**
	 * Get a key from this KeyStore or undefined if the key is not found.
	 *
	 * @param fullId The full ID used to derive the key.
	 * @param objectId The object ID of the key server holding the key.
	 */
	public getKey(fullId: Uint8Array, objectId: Uint8Array): G1Element | undefined {
		return this.keys_map.get(this.createMapKey(fullId, objectId));
	}

	/**
	 * Check if the key store has a key for the given full ID and object ID.
	 *
	 * @param fullId The full ID used to derive the key.
	 * @param objectId The object ID of the key server holding the key.
	 */
	public hasKey(fullId: Uint8Array, objectId: Uint8Array): boolean {
		return this.keys_map.has(this.createMapKey(fullId, objectId));
	}

	/** Look up URLs of key servers and fetch key from servers with request signature,
	 * cert and ephPk, then updates the caching keys_map.
	 */
	async fetchKeys({
		keyServers,
		threshold: _threshold,
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
		const fullId = createFullId(DST, packageId, ids[0]);
		const remainingKeyServers = keyServers.filter((ks) => !this.hasKey(fullId, ks.objectId));
		if (remainingKeyServers.length === 0) {
			return;
		}

		const cert = sessionKey.getCertificate();
		const signedRequest = await sessionKey.createRequestParams(txBytes);

		// TODO: wait for t completed promises (not failures).
		await Promise.all(
			remainingKeyServers.map(async (server) => {
				if (server.keyType !== KeyServerType.BonehFranklinBLS12381) {
					console.warn('Server has invalid key type: ' + server.keyType);
					return;
				}
				const res = await fetchKey(
					server.url,
					signedRequest.request_signature,
					txBytes,
					signedRequest.decryption_key,
					cert,
				);

				const key = G1Element.fromBytes(res.key);
				if (
					!BonehFranklinBLS12381Services.verifyUserSecretKey(
						key,
						fullId,
						G2Element.fromBytes(server.pk),
					)
				) {
					console.warn('Received invalid key from key server ' + server.objectId);
					return;
				}

				this.addKey(fullId, server.objectId, key);
			}),
		);
	}

	/**
	 * Decrypt the given encrypted bytes with the given cached secret keys for the full ID.
	 * It's assumed that fetchKeys has been called to fetch the secret keys for enough key servers
	 * otherwise, this will throw an error.
	 *
	 * @param encryptedObject - EncryptedObject.
	 * @returns - The decrypted plaintext corresponding to ciphertext.
	 */
	async decrypt(encryptedObject: typeof EncryptedObject.$inferType): Promise<Uint8Array> {
		if (!encryptedObject.encrypted_shares.BonehFranklinBLS12381) {
			throw new Error('Encryption mode not supported');
		}

		const fullId = createFullId(
			DST,
			encryptedObject.package_id,
			new Uint8Array(encryptedObject.inner_id),
		);

		// Get the indices of the service whose keys are in the keystore.
		const in_keystore = encryptedObject.services
			.map((_, i) => i)
			.filter((i) => this.hasKey(fullId, encryptedObject.services[i][0]));
		if (in_keystore.length < encryptedObject.threshold) {
			throw new Error('Not enough shares. Please fetch more keys.');
		}

		const encryptedShares = encryptedObject.encrypted_shares.BonehFranklinBLS12381.shares;
		if (encryptedShares.length !== encryptedObject.services.length) {
			throw new Error('Invalid input');
		}

		const nonce = G2Element.fromBytes(
			encryptedObject.encrypted_shares.BonehFranklinBLS12381.encapsulation,
		);

		// Decrypt each share.
		const shares = in_keystore.map((i: number) => {
			const [objectId, shareIndex] = encryptedObject.services[i];
			// Use the index as the unique info parameter to allow for multiple shares per key server.
			const info = new Uint8Array([shareIndex]);
			let decryptedShare = BonehFranklinBLS12381Services.decrypt(
				nonce,
				this.getKey(fullId, objectId)!,
				encryptedShares[i],
				info,
			);
			// The Shamir secret sharing library expects the index/x-coordinate to be at the end of the share.
			const share = new Uint8Array(decryptedShare.length + 1);
			share.set(decryptedShare, 0);
			share[decryptedShare.length] = shareIndex;
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
	const key = elgamalDecrypt(enc_key, resp.decryption_keys[0].encrypted_key.map(fromBase64));
	return {
		fullId: resp.decryption_keys[0].fullId,
		key,
	};
}
