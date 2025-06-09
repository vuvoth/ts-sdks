// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type {
	Experimental_BaseClient,
	Experimental_SuiClientTypes,
} from '@mysten/sui/experimental';
import type { IdentifierString } from '@mysten/wallet-standard';
import { DAppKitError } from './errors.js';

type NonEmptyArray<T> = readonly [T, ...T[]] | readonly [...T[], T] | readonly [T, ...T[], T];

export type Networks = NonEmptyArray<Experimental_SuiClientTypes.Network>;

export function getChain(network: Experimental_SuiClientTypes.Network): IdentifierString {
	return `sui:${network}`;
}

export function createNetworkConfig<TNetworks extends Networks>(
	networks: TNetworks,
	createClient: (network: TNetworks[number]) => Experimental_BaseClient,
) {
	if (networks.length === 0) {
		throw new DAppKitError('You must specify at least one Sui network for your application.');
	}

	const networkConfig = new Map<TNetworks[number], Experimental_BaseClient>();
	function getClient<T extends TNetworks[number]>(network: T | TNetworks[number]) {
		if (networkConfig.has(network)) {
			return networkConfig.get(network)!;
		}

		const client = createClient(network);
		networkConfig.set(network, client);
		return client;
	}

	return { networkConfig: Object.freeze(networkConfig), getClient };
}
