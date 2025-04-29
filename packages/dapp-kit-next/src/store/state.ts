// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { WalletWithRequiredFeatures } from '@mysten/wallet-standard';
import { map } from 'nanostores';

export type DAppKitStateValues = {
	wallets: WalletWithRequiredFeatures[];
};

export type DAppKitState = ReturnType<typeof createState>;

export function createState() {
	return map<DAppKitStateValues>({
		wallets: [],
	});
}
