// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { G1Element, Scalar } from './bls12381.js';

/**
 * Decrypt a ciphertext with a given secret key. The secret key must be a 32-byte scalar.
 * The ciphertext is a pair of G1Elements (48 bytes).
 */
export function elgamal_decrypt(sk: Uint8Array, ciphertext: [Uint8Array, Uint8Array]): Uint8Array {
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

// /**
//  * Encrypt a message with a given public key. Both the public key and the message must a compressed G1Element (48 bytes).
//  */
// function elgamal_encrypt(pk: Uint8Array, message: Uint8Array): [Uint8Array, Uint8Array] {
// 	const ciphertext = encrypt(G1Element.fromBytes(pk), G1Element.fromBytes(message));
// 	return [ciphertext[0].toBytes(), ciphertext[1].toBytes()];
// }

// /**
//  * Encrypt a message with a given public key. Both the public key and the message must a compressed G1Element (48 bytes).
//  */
// function encrypt(pk: G1Element, message: G1Element): [G1Element, G1Element] {
// 	const r = Scalar.random();
// 	return [G1Element.generator().multiply(r), pk.multiply(r).add(message)];
// }

/** Generate a random secret key. */
export function generateSecretKey(): Uint8Array {
	return Scalar.random().toBytes();
}

/** Derive the BLS public key for a given secret key. */
export function toPublicKey(sk: Uint8Array): Uint8Array {
	return G1Element.generator().multiply(Scalar.fromBytes(sk)).toBytes();
}
