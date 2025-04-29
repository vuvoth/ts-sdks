// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { UiWallet } from '@wallet-standard/ui';
import { map } from 'nanostores';

export type DAppKitStateValues = {
	wallets: UiWallet[];
};

export type DAppKitState = ReturnType<typeof createState>;

export function createState() {
	const $state = map<DAppKitStateValues>({
		wallets: [],
	});

	return { $state };
}
