// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { AesGcm256 } from '../../src/aes.js';

describe('AES encryption', () => {
	const testMessage = new TextEncoder().encode('Hi');
	const testAad = new Uint8Array([1, 2, 3, 4]);

	describe('AesGcm256', () => {
		it('should encrypt and decrypt successfully', async () => {
			const aes = new AesGcm256(testMessage, testAad);
			const key = await aes.generateKey();
			expect(key.length).toBe(32);

			const ciphertext = await aes.encrypt(key);
			expect(ciphertext.$kind).toBe('Aes256Gcm');
			expect(ciphertext.Aes256Gcm).toBeDefined();

			const aadArray = ciphertext.Aes256Gcm?.aad ?? [];
			expect(new Uint8Array(aadArray)).toEqual(testAad);

			// message length is 2, tag is 16 bytes
			expect(ciphertext.Aes256Gcm?.blob.length).toBe(18);

			const decrypted = await AesGcm256.decrypt(key, ciphertext);
			expect(decrypted).toEqual(testMessage);
		});

		it('should fail decryption with wrong key', async () => {
			const aes = new AesGcm256(testMessage, testAad);
			const key = await aes.generateKey();
			const wrongKey = await aes.generateKey();
			const ciphertext = await aes.encrypt(key);

			await expect(AesGcm256.decrypt(wrongKey, ciphertext)).rejects.toThrow();
		});

		it('should fail decryption with wrong AAD', async () => {
			const aes = new AesGcm256(testMessage, testAad);
			const key = await aes.generateKey();
			let ciphertext = await aes.encrypt(key);
			ciphertext.Aes256Gcm?.aad?.fill(1);

			await expect(AesGcm256.decrypt(key, ciphertext)).rejects.toThrow();
		});

		it('should handle empty AAD', async () => {
			const emptyAad = new Uint8Array();
			const aes = new AesGcm256(testMessage, emptyAad);
			const key = await aes.generateKey();

			const ciphertext = await aes.encrypt(key);
			const decrypted = await AesGcm256.decrypt(key, ciphertext);

			expect(decrypted).toEqual(testMessage);
		});

		it('should handle empty message', async () => {
			const emptyMessage = new Uint8Array();
			const aes = new AesGcm256(emptyMessage, testAad);
			const key = await aes.generateKey();

			const ciphertext = await aes.encrypt(key);
			const decrypted = await AesGcm256.decrypt(key, ciphertext);

			expect(decrypted).toEqual(emptyMessage);
		});
	});
});
