// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { split } from 'shamir-secret-sharing';

import type { EncryptionInput } from './aes.js';
import { BonehFranklinBLS12381Services, DST } from './ibe.js';
import type { KeyServer } from './key-server.js';
import { KeyServerType } from './key-server.js';
import { EncryptedObject } from './types.js';
import { createFullId } from './utils.js';

export const MAX_U8 = 255;

/**
 * Given full ID and what key servers to use, return the encrypted message under the identity and return the bcs bytes of the encrypted object.
 *
 * @param keyServers - A list of KeyServers (same server can be used multiple times)
 * @param packageId - packageId
 * @param id - id
 * @param encryptionInput - Input to the encryption. Should be one of the EncryptionInput types, AesGcmEncryptionInput or Plain.
 * @param threshold - The threshold for the TSS encryption.
 * @returns The bcs bytes of the encrypted object containing all metadata.
 */
export async function encrypt<Input extends EncryptionInput>(
	keyServers: KeyServer[],
	threshold: number,
	packageId: Uint8Array,
	id: Uint8Array,
	encryptionInput: Input,
): Promise<Uint8Array> {
	// Check inputs
	if (
		keyServers.length < threshold ||
		threshold === 0 ||
		keyServers.length > MAX_U8 ||
		threshold > MAX_U8 ||
		packageId.length !== 32
	) {
		throw new Error('Invalid input');
	}
	if (keyServers.some((server) => server.keyType !== KeyServerType.BonehFranklinBLS12381)) {
		throw new Error('Key type is not supported');
	}

	const ibeServers = new BonehFranklinBLS12381Services(keyServers);

	// Generate a random symmetric key and encrypt the encryption input using this key.
	const keyBytes = await encryptionInput.generateKey();
	const ciphertext = await encryptionInput.encrypt(keyBytes);

	// Split the symmetric key into shares and encrypt each share with the public keys of the key servers.
	const shares = await split(keyBytes, ibeServers.size(), threshold);

	// Encrypt the shares with the public keys of the key servers.
	const fullId = createFullId(DST, packageId, id);
	const encrypted_shares = ibeServers.encrypt_batched(
		fullId,
		shares.map((share) => share.subarray(0, 32)),
		shares.map((share) => share.subarray(32)),
	);

	// Services and indices of their shares are stored as a tuple
	const service_oids_and_indices: [Uint8Array, number][] = ibeServers
		.get_object_ids()
		.map((id, i) => [id, shares[i][32]]);

	return EncryptedObject.serialize({
		version: 0,
		package_id: packageId,
		inner_id: id,
		services: service_oids_and_indices,
		threshold,
		encrypted_shares,
		ciphertext,
	}).toBytes();
}
