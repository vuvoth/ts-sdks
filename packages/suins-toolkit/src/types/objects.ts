// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * @deprecated Use `@mysten/suins` package instead.
 */
export type SuiNSContract = {
	packageId: string;
	suins: string;
	registry: string;
	reverseRegistry: string;
};

/**
 * @deprecated Use `@mysten/suins` package instead.
 */
export type NameObject = {
	id: string;
	owner: string;
	targetAddress: string;
	avatar?: string;
	contentHash?: string;
};

/**
 * @deprecated Use `@mysten/suins` package instead.
 */
export type DataFields = 'avatar' | 'contentHash';

/**
 * @deprecated Use `@mysten/suins` package instead.
 */
export type NetworkType = 'devnet' | 'testnet';
