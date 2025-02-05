// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { fromHex, toHex } from '@mysten/bcs';
import { describe, expect, it } from 'vitest';

import { AesGcm256 } from '../../src/aes';
import { G1Element, G2Element, Scalar } from '../../src/bls12381';
import { encrypt } from '../../src/encrypt';
import { BonehFranklinBLS12381Services, DST } from '../../src/ibe';
import { kdf } from '../../src/kdf';
import { KeyStore } from '../../src/key-store';
import { EncryptedObject } from '../../src/types';
import { createFullId } from '../../src/utils';

describe('sdk tests', () => {
	function generateKeyPair(): [Scalar, G2Element] {
		const sk = Scalar.random();
		const pk = G2Element.generator().multiply(sk);
		return [sk, pk];
	}

	function extractUserSecretKey(sk: Scalar, id: Uint8Array): G1Element {
		return G1Element.hashToCurve(id).multiply(sk);
	}

	it('test encryption format', async () => {
		const [, pk1] = generateKeyPair();
		const [, pk2] = generateKeyPair();
		const [, pk3] = generateKeyPair();

		const msg = new TextEncoder().encode('My super secret message');
		const aad = new Uint8Array([1, 2, 3, 4]);

		const encryption = await encrypt(
			[
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
			2,
			fromHex('0000000000000000000000000000000000000000000000000000000000000000'),
			new Uint8Array([1, 2, 3, 4]),
			new AesGcm256(msg, aad),
		);
		const parsed = EncryptedObject.parse(encryption);

		expect(parsed.version).toEqual(0);
		expect(parsed.inner_id).toEqual([1, 2, 3, 4]);
		expect(parsed.package_id).toEqual(
			fromHex('0000000000000000000000000000000000000000000000000000000000000000'),
		);
		expect(parsed.services.length).toEqual(3);
		expect(parsed.threshold).toEqual(2);
	});

	it('encryption e2e', async () => {
		const [sk1, pk1] = generateKeyPair();
		const [sk2, pk2] = generateKeyPair();
		const [sk3, pk3] = generateKeyPair();

		const msg = new TextEncoder().encode('My super secret message');
		const aad = new Uint8Array([1, 2, 3, 4]);

		const objectId1 = fromHex('0000000000000000000000000000000000000000000000000000000000000001');
		const objectId2 = fromHex('0000000000000000000000000000000000000000000000000000000000000002');
		const objectId3 = fromHex('0000000000000000000000000000000000000000000000000000000000000003');

		const encryption = await encrypt(
			[
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
			2,
			fromHex('0000000000000000000000000000000000000000000000000000000000000000'),
			fromHex('01020304'),
			new AesGcm256(msg, aad),
		);

		const parsed = EncryptedObject.parse(encryption);

		const id = createFullId(DST, parsed.package_id, new Uint8Array(parsed.inner_id));

		const usk1 = extractUserSecretKey(sk1, id);
		const usk2 = extractUserSecretKey(sk2, id);
		const usk3 = extractUserSecretKey(sk3, id);

		// Sanity checks for verify_user_secret_key
		expect(BonehFranklinBLS12381Services.verify_user_secret_key(usk1, id, pk1)).toBeTruthy();
		expect(BonehFranklinBLS12381Services.verify_user_secret_key(usk2, id, pk2)).toBeTruthy();
		expect(BonehFranklinBLS12381Services.verify_user_secret_key(usk3, id, pk3)).toBeTruthy();
		expect(
			BonehFranklinBLS12381Services.verify_user_secret_key(usk1, new Uint8Array([1, 2]), pk1),
		).toBeFalsy();
		expect(
			BonehFranklinBLS12381Services.verify_user_secret_key(G1Element.generator(), id, pk1),
		).toBeFalsy();
		expect(
			BonehFranklinBLS12381Services.verify_user_secret_key(usk1, id, G2Element.generator()),
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
	//
	// it("encryption e2e plain", async () => {
	//   const [sk1, pk1] = generateKeyPair();
	//   const [sk2, pk2] = generateKeyPair();
	//   const [sk3, pk3] = generateKeyPair();
	//
	//   const encryption = await encrypt(
	//     [
	//       { objectId: "0000000000000000000000000000000000000000000000000000000000000001", pk: pk1.toBytes(), name: "test", url: "https://test.com", key_type: 0},
	//       { objectId: "0000000000000000000000000000000000000000000000000000000000000002", pk: pk2.toBytes(), name: "test2", url: "https://test2.com", key_type: 0},
	//       { objectId: "0000000000000000000000000000000000000000000000000000000000000003", pk: pk3.toBytes(), name: "test3", url: "https://test3.com", key_type: 0},
	//     ],
	//     2,
	//     fromHEX("0000000000000000000000000000000000000000000000000000000000000000"),
	//     fromHEX("01020304"),
	//     new Plain(),
	//   );
	//
	//   const parsed = EncryptedObject.parse(encryption);
	//
	//   const id = createFullId(DST, parsed.package_id, new Uint8Array(parsed.inner_id));
	//
	//   const usk1 = extractUserSecretKey(sk1, id);
	//   const usk2 = extractUserSecretKey(sk2, id);
	//   const usk3 = extractUserSecretKey(sk3, id);
	//
	//   const key = await decrypt(
	//     parsed,
	//     [usk1.toBytes(), usk2.toBytes(), usk3.toBytes()],
	//   );
	//
	//   const modified_parsed_23 = parsed;
	//   modified_parsed_23.services = parsed.services.slice(1);
	//   modified_parsed_23.encrypted_shares.BonehFranklinBLS12381.shares = parsed.encrypted_shares.BonehFranklinBLS12381.shares.slice(1);
	//   const key2 = await decrypt(
	//     modified_parsed_23,
	//     [usk2.toBytes(), usk3.toBytes()],
	//   );
	//
	//   expect(key).toEqual(key2);
	//
	//   // Giving only one share will make the decryption fail.
	//   const modified_parsed_1 = parsed;
	//   modified_parsed_1.services = parsed.services.slice(0, 1);
	//   modified_parsed_1.encrypted_shares.BonehFranklinBLS12381.shares = parsed.encrypted_shares.BonehFranklinBLS12381.shares.slice(0, 1);
	//   await expect(
	//     decrypt(
	//       modified_parsed_1,
	//       [usk2.toBytes()],
	//     ),
	//   ).rejects.toThrow();
	//
	//   // But if we're also decreasing the threshold on the EncryptedObject the decryption succeeds, but the key is not the correct one.
	//   const modified_parsed_1_threshold = parsed;
	//   modified_parsed_1_threshold.services = parsed.services.slice(0, 1);
	//   modified_parsed_1_threshold.encrypted_shares.BonehFranklinBLS12381.shares = parsed.encrypted_shares.BonehFranklinBLS12381.shares.slice(0, 1);
	//   modified_parsed_1_threshold.threshold = 1;
	//   const key3 = await decrypt(
	//       modified_parsed_1,
	//       [usk2.toBytes()],
	//     );
	//   expect(key3).not.toEqual(key);
	// });
});

describe('encryption scheme', () => {
	it('hash regression test', async () => {
		const package_id = new Uint8Array(32);
		const inner_id = new Uint8Array([1, 2, 3, 4]);
		const hash = G1Element.hashToCurve(createFullId(DST, package_id, inner_id));
		const expected =
			'b32685b6ffd1f373faf3abb10c05772e033f75da8af729c3611d81aea845670db48ceadd0132d3a667dbbaa36acefac7';
		expect(toHex(hash.toBytes())).toEqual(expected);
	});
});

describe('kdf', () => {
	it('regression test', () => {
		const x = G1Element.generator().pairing(
			G2Element.generator().multiply(Scalar.fromNumber(12345)),
		);
		const key = kdf(x, new Uint8Array([]));
		expect(key).toEqual(
			fromHex('7ce8116a76d7d0f5a89c0dbb547c6321f584b647a0d375a266ae05e9f14997e9'),
		);
	});
});
