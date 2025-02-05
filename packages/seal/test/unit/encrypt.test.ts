// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { fromHex, toHex } from '@mysten/bcs';
import { describe, expect, it } from 'vitest';

import { AesGcm256, Plain } from '../../src/aes';
import { G1Element, G2Element, Scalar } from '../../src/bls12381';
import { encrypt } from '../../src/encrypt';
import { BonehFranklinBLS12381Services, DST } from '../../src/ibe';
import { kdf } from '../../src/kdf';
import { KeyStore } from '../../src/key-store';
import { EncryptedObject } from '../../src/types';
import { createFullId } from '../../src/utils';

describe('Seal encryption tests', () => {
	function generateKeyPair(): [Scalar, G2Element] {
		const sk = Scalar.random();
		const pk = G2Element.generator().multiply(sk);
		return [sk, pk];
	}

	function extractUserSecretKey(sk: Scalar, id: Uint8Array): G1Element {
		return G1Element.hashToCurve(id).multiply(sk);
	}

	it('sanity checks for encryption format', async () => {
		const [, pk1] = generateKeyPair();
		const [, pk2] = generateKeyPair();
		const [, pk3] = generateKeyPair();

		const msg = new TextEncoder().encode('My super secret message');
		const aad = new Uint8Array([1, 2, 3, 4]);

		const encryption = await encrypt({
			keyServers: [
				{
					objectId: fromHex('0000000000000000000000000000000000000000000000000000000000000001'),
					pk: pk1.toBytes(),
					name: 'test',
					url: 'https://test.com',
					keyType: 0,
				},
				{
					objectId: fromHex('0000000000000000000000000000000000000000000000000000000000000002'),
					pk: pk2.toBytes(),
					name: 'test2',
					url: 'https://test2.com',
					keyType: 0,
				},
				{
					objectId: fromHex('0000000000000000000000000000000000000000000000000000000000000003'),
					pk: pk3.toBytes(),
					name: 'test3',
					url: 'https://test3.com',
					keyType: 0,
				},
			],
			threshold: 2,
			packageId: fromHex('0000000000000000000000000000000000000000000000000000000000000000'),
			id: new Uint8Array([1, 2, 3, 4]),
			encryptionInput: new AesGcm256(msg, aad),
		});
		const parsed = EncryptedObject.parse(encryption);

		expect(parsed.version).toEqual(0);
		expect(parsed.inner_id).toEqual([1, 2, 3, 4]);
		expect(parsed.package_id).toEqual(
			fromHex('0000000000000000000000000000000000000000000000000000000000000000'),
		);
		expect(parsed.services.length).toEqual(3);
		expect(parsed.threshold).toEqual(2);
	});

	it('test encryption round-trip with AesGcm-mode', async () => {
		const [sk1, pk1] = generateKeyPair();
		const [sk2, pk2] = generateKeyPair();
		const [sk3, pk3] = generateKeyPair();

		const msg = new TextEncoder().encode('My super secret message');
		const aad = new Uint8Array([1, 2, 3, 4]);

		const objectId1 = fromHex('0000000000000000000000000000000000000000000000000000000000000001');
		const objectId2 = fromHex('0000000000000000000000000000000000000000000000000000000000000002');
		const objectId3 = fromHex('0000000000000000000000000000000000000000000000000000000000000003');

		const encryption = await encrypt({
			keyServers: [
				{
					objectId: objectId1,
					pk: pk1.toBytes(),
					name: 'test',
					url: 'https://test.com',
					keyType: 0,
				},
				{
					objectId: objectId2,
					pk: pk2.toBytes(),
					name: 'test2',
					url: 'https://test2.com',
					keyType: 0,
				},
				{
					objectId: objectId3,
					pk: pk3.toBytes(),
					name: 'test3',
					url: 'https://test3.com',
					keyType: 0,
				},
			],
			threshold: 2,
			packageId: fromHex('0000000000000000000000000000000000000000000000000000000000000000'),
			id: fromHex('01020304'),
			encryptionInput: new AesGcm256(msg, aad),
		});

		const parsed = EncryptedObject.parse(encryption);

		const id = createFullId(DST, parsed.package_id, new Uint8Array(parsed.inner_id));

		const usk1 = extractUserSecretKey(sk1, id);
		const usk2 = extractUserSecretKey(sk2, id);
		const usk3 = extractUserSecretKey(sk3, id);

		// Sanity checks for verify_user_secret_key
		expect(BonehFranklinBLS12381Services.verifyUserSecretKey(usk1, id, pk1)).toBeTruthy();
		expect(BonehFranklinBLS12381Services.verifyUserSecretKey(usk2, id, pk2)).toBeTruthy();
		expect(BonehFranklinBLS12381Services.verifyUserSecretKey(usk3, id, pk3)).toBeTruthy();
		expect(
			BonehFranklinBLS12381Services.verifyUserSecretKey(usk1, new Uint8Array([1, 2]), pk1),
		).toBeFalsy();
		expect(
			BonehFranklinBLS12381Services.verifyUserSecretKey(G1Element.generator(), id, pk1),
		).toBeFalsy();
		expect(
			BonehFranklinBLS12381Services.verifyUserSecretKey(usk1, id, G2Element.generator()),
		).toBeFalsy();

		const key_store = new KeyStore();
		key_store.addKey(toHex(id), objectId1, usk1.toBytes());
		key_store.addKey(toHex(id), objectId2, usk2.toBytes());
		key_store.addKey(toHex(id), objectId3, usk3.toBytes());

		await expect(key_store.decrypt(parsed)).resolves.toEqual(msg);

		const key_store_23 = new KeyStore();
		key_store_23.addKey(toHex(id), objectId2, usk2.toBytes());
		key_store_23.addKey(toHex(id), objectId3, usk3.toBytes());
		const modified_parsed_23 = parsed;
		modified_parsed_23.services = parsed.services.slice(1);
		modified_parsed_23.encrypted_shares.BonehFranklinBLS12381.shares =
			parsed.encrypted_shares.BonehFranklinBLS12381.shares.slice(1);
		await expect(key_store_23.decrypt(modified_parsed_23)).resolves.toEqual(msg);

		const key_store_1 = new KeyStore();
		key_store_1.addKey(toHex(id), objectId1, usk1.toBytes());
		const modified_parsed_1 = parsed;
		modified_parsed_1.services = parsed.services.slice(0, 1);
		modified_parsed_1.encrypted_shares.BonehFranklinBLS12381.shares =
			parsed.encrypted_shares.BonehFranklinBLS12381.shares.slice(0, 1);
		await expect(key_store_1.decrypt(modified_parsed_1)).rejects.toThrow();
	});

	it('test encryption roundtrip with Plain-mode', async () => {
		const [sk1, pk1] = generateKeyPair();
		const [sk2, pk2] = generateKeyPair();
		const [sk3, pk3] = generateKeyPair();

		const objectId1 = fromHex('0000000000000000000000000000000000000000000000000000000000000001');
		const objectId2 = fromHex('0000000000000000000000000000000000000000000000000000000000000002');
		const objectId3 = fromHex('0000000000000000000000000000000000000000000000000000000000000003');

		const encryption = await encrypt({
			keyServers: [
				{
					objectId: objectId1,
					pk: pk1.toBytes(),
					name: 'test',
					url: 'https://test.com',
					keyType: 0,
				},
				{
					objectId: objectId2,
					pk: pk2.toBytes(),
					name: 'test2',
					url: 'https://test2.com',
					keyType: 0,
				},
				{
					objectId: objectId3,
					pk: pk3.toBytes(),
					name: 'test3',
					url: 'https://test3.com',
					keyType: 0,
				},
			],
			threshold: 2,
			packageId: fromHex('0000000000000000000000000000000000000000000000000000000000000000'),
			id: fromHex('01020304'),
			encryptionInput: new Plain(),
		});

		const parsed = EncryptedObject.parse(encryption);

		const id = createFullId(DST, parsed.package_id, new Uint8Array(parsed.inner_id));

		const usk1 = extractUserSecretKey(sk1, id);
		const usk2 = extractUserSecretKey(sk2, id);
		const usk3 = extractUserSecretKey(sk3, id);
		const key_store = new KeyStore();
		key_store.addKey(toHex(id), objectId1, usk1.toBytes());
		key_store.addKey(toHex(id), objectId2, usk2.toBytes());
		key_store.addKey(toHex(id), objectId3, usk3.toBytes());

		const key = await key_store.decrypt(parsed);

		const key_store_23 = new KeyStore();
		key_store_23.addKey(toHex(id), objectId2, usk2.toBytes());
		key_store_23.addKey(toHex(id), objectId3, usk3.toBytes());
		const modified_parsed_23 = parsed;
		modified_parsed_23.services = parsed.services.slice(1);
		modified_parsed_23.encrypted_shares.BonehFranklinBLS12381.shares =
			parsed.encrypted_shares.BonehFranklinBLS12381.shares.slice(1);
		await expect(key_store_23.decrypt(modified_parsed_23)).resolves.toEqual(key);

		const key_store_1 = new KeyStore();
		key_store_1.addKey(toHex(id), objectId1, usk1.toBytes());
		const modified_parsed_1 = parsed;
		modified_parsed_1.services = parsed.services.slice(0, 1);
		modified_parsed_1.encrypted_shares.BonehFranklinBLS12381.shares =
			parsed.encrypted_shares.BonehFranklinBLS12381.shares.slice(0, 1);
		await expect(key_store_1.decrypt(modified_parsed_1)).rejects.toThrow();
	});

	it('G1 hash-to-curve regression test', async () => {
		const package_id = new Uint8Array(32);
		const inner_id = new Uint8Array([1, 2, 3, 4]);
		const hash = G1Element.hashToCurve(createFullId(DST, package_id, inner_id));
		const expected =
			'b32685b6ffd1f373faf3abb10c05772e033f75da8af729c3611d81aea845670db48ceadd0132d3a667dbbaa36acefac7';
		expect(toHex(hash.toBytes())).toEqual(expected);
	});

	it('kdf regression test', () => {
		const x = G1Element.generator().pairing(
			G2Element.generator().multiply(Scalar.fromNumber(12345)),
		);
		const key = kdf(x, new Uint8Array([]));
		expect(key).toEqual(
			fromHex('7ce8116a76d7d0f5a89c0dbb547c6321f584b647a0d375a266ae05e9f14997e9'),
		);
	});
});
