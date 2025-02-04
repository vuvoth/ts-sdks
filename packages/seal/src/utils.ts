// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

export function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
	if (a.length !== b.length) {
		throw new Error('Invalid input');
	}
	return a.map((ai, i) => ai ^ b[i]);
}

/**
 * Create a full ID concatenating DST || package ID || inner ID.
 * @param dst - The domain separation tag.
 * @param packageId - The package ID.
 * @param innerId - The inner ID.
 * @returns The full ID.
 */
export function createFullId(
	dst: Uint8Array,
	packageId: Uint8Array,
	innerId: Uint8Array,
): Uint8Array {
	const fullId = new Uint8Array(1 + dst.length + packageId.length + innerId.length);
	fullId.set([dst.length], 0);
	fullId.set(dst, 1);
	fullId.set(packageId, 1 + dst.length);
	fullId.set(innerId, 1 + dst.length + packageId.length);
	return fullId;
}
