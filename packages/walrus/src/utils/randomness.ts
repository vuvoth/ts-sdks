// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

export function getRandom<T>(array: T[]): T {
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
}
