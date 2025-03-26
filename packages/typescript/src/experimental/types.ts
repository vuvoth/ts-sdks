// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable @typescript-eslint/ban-types */

import type { Experimental_SuiClient } from './client.js';

export type SuiClientRegistration<
	T extends Experimental_SuiClient = Experimental_SuiClient,
	Name extends string = string,
	Extension = unknown,
> =
	| {
			readonly name: Name;
			readonly register: (client: T) => Extension;
	  }
	| SelfRegisteringClientExtension<T, Name, Extension>;

export interface SelfRegisteringClientExtension<
	T extends Experimental_SuiClient = Experimental_SuiClient,
	Name extends string = string,
	Extension = unknown,
> {
	experimental_asClientExtension: () => {
		readonly name: Name;
		readonly register: (client: T) => Extension;
	};
}

export type Simplify<T> = {
	[K in keyof T]: T[K];
} & {};

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;

export type ClientWithExtensions<T> = Experimental_SuiClient & T;

export namespace Experimental_SuiClientTypes {
	export type Network = 'mainnet' | 'testnet' | 'devnet' | 'localnet' | (string & {});

	export interface SuiClientOptions {
		network: Network;
	}
	/** Object methods */
	export interface TransportMethods {
		getObjects?: (options: GetObjectsOptions) => Promise<GetObjectsResponse>;
		getOwnedObjects?: (options: GetOwnedObjectsOptions) => Promise<GetOwnedObjectsResponse>;
	}

	export interface GetObjectsOptions {
		objectIds: string[];
	}

	export interface GetOwnedObjectsOptions {
		address: string;
		limit?: number;
		cursor?: string | null;
		type?: string;
	}

	export interface GetObjectsResponse {
		objects: (ObjectResponse | Error)[];
	}

	export interface GetOwnedObjectsResponse {
		objects: ObjectResponse[];
		hasNextPage: boolean;
		cursor: string | null;
	}

	export interface ObjectResponse {
		id: string;
		version: string;
		digest: string;
		owner: ObjectOwner;
		type: string;
		content: Uint8Array;
	}

	/** Balance methods */
	export interface TransportMethods {
		getBalance?: (options: GetBalanceOptions) => Promise<GetBalanceResponse>;
		getAllBalances?: (options: GetAllBalancesOptions) => Promise<GetAllBalancesResponse>;
	}

	export interface GetBalanceOptions {
		address: string;
		coinType: string;
	}

	export interface CoinBalance {
		coinType: string;
		balance: bigint;
	}

	export interface GetBalanceResponse {
		balance: CoinBalance;
	}

	export interface GetAllBalancesOptions {
		address: string;
		limit?: number;
		cursor?: string | null;
	}

	export interface GetAllBalancesResponse {
		balances: CoinBalance[];
		hasNextPage: boolean;
		cursor: string | null;
	}

	/** Transaction methods */
	export interface TransportMethods {
		getTransaction?: (options: GetTransactionOptions) => Promise<GetTransactionResponse>;
		executeTransaction?: (
			options: ExecuteTransactionOptions,
		) => Promise<ExecuteTransactionResponse>;
		dryRunTransaction?: (options: DryRunTransactionOptions) => Promise<DryRunTransactionResponse>;
	}

	export interface TransactionResponse {
		digest: string;
		signatures: string[];
		// TODO: Return parsed data:
		// We need structured representations of effects, events, and transaction data
		bcs: Uint8Array;
		effects: Uint8Array;
		events?: Uint8Array;
	}

	export interface GetTransactionOptions {
		digest: string;
	}

	export interface GetTransactionResponse {
		transaction: TransactionResponse;
	}

	export interface ExecuteTransactionOptions {
		transaction: Uint8Array;
		signatures: string[];
	}

	export interface DryRunTransactionOptions {
		transaction: Uint8Array;
		signatures: string[];
	}

	export interface DryRunTransactionResponse {
		transaction: TransactionResponse;
	}

	export interface ExecuteTransactionResponse {
		transaction: TransactionResponse;
	}

	export interface TransportMethods {
		getReferenceGasPrice?: () => Promise<GetReferenceGasPriceResponse>;
	}

	export interface GetReferenceGasPriceResponse {
		referenceGasPrice: bigint;
	}

	/** ObjectOwner types */

	export interface AddressOwner {
		$kind: 'AddressOwner';
		AddressOwner: string;
	}

	export interface ParentOwner {
		$kind: 'ObjectOwner';
		ObjectOwner: string;
	}

	export interface SharedOwner {
		$kind: 'Shared';
		Shared: {
			initialSharedVersion: string;
		};
	}

	export interface ImmutableOwner {
		$kind: 'Immutable';
		Immutable: true;
	}

	export interface ConsensusV2Owner {
		$kind: 'ConsensusV2';
		ConsensusV2Owner: {
			authenticator: ConsensusV2Authenticator;
			startVersion: string;
		};
	}

	export interface SingleOwnerAuthenticator {
		$kind: 'SingleOwner';
		SingleOwner: string;
	}

	export type ConsensusV2Authenticator = SingleOwnerAuthenticator;

	export type ObjectOwner =
		| AddressOwner
		| ParentOwner
		| SharedOwner
		| ImmutableOwner
		| ConsensusV2Owner;
}
