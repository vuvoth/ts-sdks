// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { G1Element, G2Element, Scalar } from './bls12381.js';

/**
 * Decrypt a ciphertext with a given secret key. The secret key must be a 32-byte scalar.
 * The ciphertext is a pair of G1Elements (48 bytes).
 */
export function elgamalDecrypt(sk: Uint8Array, ciphertext: [Uint8Array, Uint8Array]): Uint8Array {
	return decrypt(Scalar.fromBytes(sk), [
		G1Element.fromBytes(ciphertext[0]),
		G1Element.fromBytes(ciphertext[1]),
	]).toBytes();
}

/**
 * Decrypt a ciphertext with a given secret key. The secret key must be a 32-byte scalar.
 * The ciphertext is a pair of G1Elements (48 bytes).
 */
function decrypt(sk: Scalar, encryption: [G1Element, G1Element]): G1Element {
	return encryption[1].subtract(encryption[0].multiply(sk));
}

/** Generate a random secret key. */
export function generateSecretKey(): Uint8Array {
	return Scalar.random().toBytes();
}

/** Derive the BLS public key for a given secret key. */
export function toPublicKey(sk: Uint8Array): Uint8Array {
	return G1Element.generator().multiply(Scalar.fromBytes(sk)).toBytes();
}

/** Derive the BLS verification key for a given secret key. */
export function toVerificationKey(sk: Uint8Array): Uint8Array {
	return G2Element.generator().multiply(Scalar.fromBytes(sk)).toBytes();
}
