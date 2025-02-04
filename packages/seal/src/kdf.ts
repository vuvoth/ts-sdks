// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { hkdf } from '@noble/hashes/hkdf';
import { sha3_256 } from '@noble/hashes/sha3';

import type { GTElement } from './bls12381.js';

/**
 * The default key derivation function.
 *
 * @param element The GTElement to derive the key from.
 * @param info Optional context and application specific information.
 * @returns The derived key.
 */
export function kdf(element: GTElement, info: Uint8Array): Uint8Array {
	return hkdf(sha3_256, element.toBytes(), '', info, 32);
}
