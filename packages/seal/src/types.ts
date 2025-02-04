// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { bcs } from '@mysten/sui/bcs';

export const IBEEncryptions = bcs.enum('IBEEncryptions', {
	BonehFranklinBLS12381: bcs.struct('BonehFranklinBLS12381', {
		encapsulation: bcs.bytes(96),
		shares: bcs.vector(bcs.bytes(32)),
	}),
});
export type IBEEncryptionsType = typeof IBEEncryptions.$inferType;

export const Ciphertext = bcs.enum('Ciphertext', {
	Aes256Gcm: bcs.struct('Aes256Gcm', {
		blob: bcs.vector(bcs.U8),
		aad: bcs.option(bcs.vector(bcs.U8)),
	}),
	Plain: bcs.struct('Plain', {}),
});
export type CiphertextType = typeof Ciphertext.$inferType;

/**
 * The encrypted object format. Should be aligned with the Rust implementation.
 */
export const EncryptedObject = bcs.struct('EncryptedObject', {
	version: bcs.U8,
	package_id: bcs.bytes(32),
	inner_id: bcs.vector(bcs.U8),
	services: bcs.vector(bcs.tuple([bcs.bytes(32), bcs.U8])),
	threshold: bcs.U8,
	encrypted_shares: IBEEncryptions,
	ciphertext: Ciphertext,
});
