// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable @typescript-eslint/ban-types */

import type {
	ClientWithExtensions,
	Experimental_SuiClientTypes,
	Simplify,
	SuiClientRegistration,
	UnionToIntersection,
} from './types.js';

export class Experimental_SuiClient implements Experimental_SuiClientTypes.TransportMethods {
	#transports: Experimental_SuiClientTypes.TransportMethods[] = [];
	network: Experimental_SuiClientTypes.Network;

	constructor({ network }: Experimental_SuiClientTypes.SuiClientOptions) {
		this.network = network;
	}

	#transportMethod<T extends keyof Experimental_SuiClientTypes.TransportMethods>(
		method: T,
		...args: Parameters<NonNullable<Experimental_SuiClientTypes.TransportMethods[T]>>
	): ReturnType<NonNullable<Experimental_SuiClientTypes.TransportMethods[T]>> {
		for (const transport of this.#transports) {
			if (transport[method]) {
				return (transport[method] as (...args: any[]) => any)(...args);
			}
		}
		throw new Error(`No transport method found for ${method}`);
	}

	getBalance(options: Experimental_SuiClientTypes.GetBalanceOptions) {
		return this.#transportMethod('getBalance', options);
	}

	getAllBalances(options: Experimental_SuiClientTypes.GetAllBalancesOptions) {
		return this.#transportMethod('getAllBalances', options);
	}

	getTransaction(options: Experimental_SuiClientTypes.GetTransactionOptions) {
		return this.#transportMethod('getTransaction', options);
	}

	executeTransaction(options: Experimental_SuiClientTypes.ExecuteTransactionOptions) {
		return this.#transportMethod('executeTransaction', options);
	}

	dryRunTransaction(options: Experimental_SuiClientTypes.DryRunTransactionOptions) {
		return this.#transportMethod('dryRunTransaction', options);
	}

	getReferenceGasPrice() {
		return this.#transportMethod('getReferenceGasPrice');
	}

	$registerTransport(transport: Experimental_SuiClientTypes.TransportMethods) {
		this.#transports.push(transport);
	}

	$extend<const Registrations extends SuiClientRegistration<this>[]>(
		...registrations: Registrations
	) {
		return Object.create(
			this,
			Object.fromEntries(
				registrations.map((registration) => {
					if ('experimental_asClientExtension' in registration) {
						const { name, register } = registration.experimental_asClientExtension();
						return [name, { value: register(this) }];
					}
					return [registration.name, { value: registration.register(this) }];
				}),
			),
		) as ClientWithExtensions<
			Simplify<
				Omit<
					{
						[K in keyof this]: this[K];
					},
					keyof Experimental_SuiClient
				> &
					UnionToIntersection<
						{
							[K in keyof Registrations]: Registrations[K] extends SuiClientRegistration<
								this,
								infer Name extends string,
								infer Extension
							>
								? {
										[K2 in Name]: Extension;
									}
								: never;
						}[number]
					>
			>
		>;
	}
}
