// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { G1Element, Scalar } from '../../src/bls12381';
import { elgamal_decrypt, generateSecretKey, toPublicKey } from '../../src/elgamal';

describe('ElGamal encryption', () => {
	it('should generate valid key pair', () => {
		const sk = generateSecretKey();
		const pk = toPublicKey(sk);

		expect(sk).toBeInstanceOf(Uint8Array);
		expect(sk.length).toBe(32);
		expect(pk).toBeInstanceOf(Uint8Array);
		expect(pk.length).toBe(48);
	});

	it('should decrypt successfully', () => {
		const sk = generateSecretKey();
		const pk = toPublicKey(sk);

		const message = G1Element.generator().multiply(Scalar.random());
		const messageBytes = message.toBytes();

		const r = Scalar.random();
		const c1 = G1Element.generator().multiply(r);
		const c2 = G1Element.fromBytes(pk).multiply(r).add(message);
		const ciphertext: [Uint8Array, Uint8Array] = [c1.toBytes(), c2.toBytes()];

		const decrypted = elgamal_decrypt(sk, ciphertext);
		expect(decrypted).toEqual(messageBytes);

		// try with a different key
		const sk2 = generateSecretKey();
		const decrypted2 = elgamal_decrypt(sk2, ciphertext);
		expect(decrypted2).not.toEqual(message.toBytes());
	});

	it('should throw on invalid ciphertext', () => {
		const sk = generateSecretKey();

		// Test with invalid ciphertext lengths
		const invalidCiphertext1: [Uint8Array, Uint8Array] = [
			new Uint8Array(47), // Wrong length for G1 point
			new Uint8Array(48),
		];

		const invalidCiphertext2: [Uint8Array, Uint8Array] = [
			new Uint8Array(48),
			new Uint8Array(47), // Wrong length for G1 point
		];

		expect(() => elgamal_decrypt(sk, invalidCiphertext1)).toThrow();
		expect(() => elgamal_decrypt(sk, invalidCiphertext2)).toThrow();
	});
});
