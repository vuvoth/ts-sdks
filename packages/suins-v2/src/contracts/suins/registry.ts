// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { bcs } from '@mysten/sui/bcs';
import type { Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments } from '../utils/index.js';
import type { RawTransactionArgument } from '../utils/index.js';
import * as table from './deps/sui/table.js';
export function Registry() {
	return bcs.struct('Registry', {
		/**
		 * The `registry` table maps `Domain` to `NameRecord`. Added / replaced in the
		 * `add_record` function.
		 */
		registry: table.Table(),
		/**
		 * The `reverse_registry` table maps `address` to `domain_name`. Updated in the
		 * `set_reverse_lookup` function.
		 */
		reverse_registry: table.Table(),
	});
}
export function init(packageAddress: string) {
	function _new(options: { arguments: [_: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::suins::AdminCap`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'new',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Attempts to add a new record to the registry without looking at the grace
	 * period. Currently used for subdomains where there's no grace period to respect.
	 * Returns a `SuinsRegistration` upon success.
	 */
	function add_record_ignoring_grace_period(options: {
		arguments: [
			self: RawTransactionArgument<string>,
			domain: RawTransactionArgument<string>,
			no_years: RawTransactionArgument<number>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::domain::Domain`,
			'u8',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'add_record_ignoring_grace_period',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Attempts to add a new record to the registry and returns a `SuinsRegistration`
	 * upon success. Only use with second-level names. Enforces a `grace_period` by
	 * default. Not suitable for subdomains (unless a grace period is needed).
	 */
	function add_record(options: {
		arguments: [
			self: RawTransactionArgument<string>,
			domain: RawTransactionArgument<string>,
			no_years: RawTransactionArgument<number>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::domain::Domain`,
			'u8',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'add_record',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Attempts to burn an NFT and get storage rebates. Only works if the NFT has
	 * expired.
	 */
	function burn_registration_object(options: {
		arguments: [self: RawTransactionArgument<string>, nft: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'burn_registration_object',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Allow creation of subdomain wrappers only to authorized modules. */
	function wrap_subdomain(options: {
		arguments: [_: RawTransactionArgument<string>, nft: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'wrap_subdomain',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Attempts to burn a subdomain registration object, and also invalidates any
	 * records in the registry / reverse registry.
	 */
	function burn_subdomain_object(options: {
		arguments: [self: RawTransactionArgument<string>, nft: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::subdomain_registration::SubDomainRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'burn_subdomain_object',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Adds a `leaf` record to the registry. A `leaf` record is a record that is a
	 * subdomain and doesn't have an equivalent `SuinsRegistration` object.
	 *
	 * Instead, the parent's `SuinsRegistration` object is used to manage
	 * target_address & remove it / determine expiration.
	 *
	 * 1.  Leaf records can't have children. They only work as a resolving mechanism.
	 * 2.  Leaf records must always have a `target` address (can't point to `none`).
	 * 3.  Leaf records do not expire. Their expiration date is actually what defines
	 *     their type.
	 *
	 * Leaf record's expiration is defined by the parent's expiration. Since the parent
	 * can only be a `node`, we need to check that the parent's NFT_ID is valid &
	 * hasn't expired.
	 */
	function add_leaf_record(options: {
		arguments: [
			self: RawTransactionArgument<string>,
			domain: RawTransactionArgument<string>,
			target: RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::domain::Domain`,
			'address',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'add_leaf_record',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Can be used to remove a leaf record. Leaf records do not have any symmetrical
	 * `SuinsRegistration` object. Authorization of who calls this is delegated to the
	 * authorized module that calls this.
	 */
	function remove_leaf_record(options: {
		arguments: [self: RawTransactionArgument<string>, domain: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::domain::Domain`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'remove_leaf_record',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_target_address(options: {
		arguments: [
			self: RawTransactionArgument<string>,
			domain: RawTransactionArgument<string>,
			new_target: RawTransactionArgument<string | null>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::domain::Domain`,
			'0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<address>',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'set_target_address',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function unset_reverse_lookup(options: {
		arguments: [self: RawTransactionArgument<string>, address: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [`${packageAddress}::registry::Registry`, 'address'] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'unset_reverse_lookup',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Reverse lookup can only be set for the record that has the target address. */
	function set_reverse_lookup(options: {
		arguments: [
			self: RawTransactionArgument<string>,
			address: RawTransactionArgument<string>,
			domain: RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			'address',
			`${packageAddress}::domain::Domain`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'set_reverse_lookup',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Update the `expiration_timestamp_ms` of the given `SuinsRegistration` and
	 * `NameRecord`. Requires the `SuinsRegistration` to make sure that both timestamps
	 * are in sync.
	 */
	function set_expiration_timestamp_ms(options: {
		arguments: [
			self: RawTransactionArgument<string>,
			nft: RawTransactionArgument<string>,
			domain: RawTransactionArgument<string>,
			expiration_timestamp_ms: RawTransactionArgument<number | bigint>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::suins_registration::SuinsRegistration`,
			`${packageAddress}::domain::Domain`,
			'u64',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'set_expiration_timestamp_ms',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Update the `data` of the given `NameRecord` using a `SuinsRegistration`. Use
	 * with caution and validate(!!) that any system fields are not removed
	 * (accidentally), when building authorized packages that can write the metadata
	 * field.
	 */
	function set_data(options: {
		arguments: [self: RawTransactionArgument<string>, domain: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::domain::Domain`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'set_data',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Check whether the given `domain` is registered in the `Registry`. */
	function has_record(options: {
		arguments: [self: RawTransactionArgument<string>, domain: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::domain::Domain`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'has_record',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Returns the `NameRecord` associated with the given domain or None. */
	function lookup(options: {
		arguments: [self: RawTransactionArgument<string>, domain: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::domain::Domain`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'lookup',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Returns the `domain_name` associated with the given address or None. */
	function reverse_lookup(options: {
		arguments: [self: RawTransactionArgument<string>, address: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [`${packageAddress}::registry::Registry`, 'address'] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'reverse_lookup',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Asserts that the provided NFT:
	 *
	 * 1.  Matches the ID in the corresponding `Record`
	 * 2.  Has not expired (does not take into account the grace period)
	 */
	function assert_nft_is_authorized(options: {
		arguments: [self: RawTransactionArgument<string>, nft: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'assert_nft_is_authorized',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Returns the `data` associated with the given `Domain`. */
	function get_data(options: {
		arguments: [self: RawTransactionArgument<string>, domain: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::registry::Registry`,
			`${packageAddress}::domain::Domain`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'registry',
				function: 'get_data',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return {
		_new,
		add_record_ignoring_grace_period,
		add_record,
		burn_registration_object,
		wrap_subdomain,
		burn_subdomain_object,
		add_leaf_record,
		remove_leaf_record,
		set_target_address,
		unset_reverse_lookup,
		set_reverse_lookup,
		set_expiration_timestamp_ms,
		set_data,
		has_record,
		lookup,
		reverse_lookup,
		assert_nft_is_authorized,
		get_data,
	};
}
