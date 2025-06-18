// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * The `NameRecord` is a struct that represents a single record in the registry.
 * Can be replaced by any other data structure due to the way `NameRecord`s are
 * stored and managed. SuiNS has no direct and permanent dependency on this module.
 */

import { bcs } from '@mysten/sui/bcs';
import type { Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments } from '../utils/index.js';
import type { RawTransactionArgument } from '../utils/index.js';
import * as vec_map from './deps/sui/vec_map.js';
export function NameRecord() {
	return bcs.struct('NameRecord', {
		/**
		 * The ID of the `SuinsRegistration` assigned to this record.
		 *
		 * The owner of the corresponding `SuinsRegistration` has the rights to be able to
		 * change and adjust the `target_address` of this domain.
		 *
		 * It is possible that the ID changes if the record expires and is purchased by
		 * someone else.
		 */
		nft_id: bcs.Address,
		/** Timestamp in milliseconds when the record expires. */
		expiration_timestamp_ms: bcs.u64(),
		/** The target address that this domain points to */
		target_address: bcs.option(bcs.Address),
		/** Additional data which may be stored in a record */
		data: vec_map.VecMap(bcs.string(), bcs.string()),
	});
}
export function init(packageAddress: string) {
	/** Create a new NameRecord. */
	function _new(options: {
		arguments: [expiration_timestamp_ms: RawTransactionArgument<number | bigint>];
	}) {
		const argumentsTypes = ['u64'] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'new',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Create a `leaf` NameRecord. */
	function new_leaf(options: {
		arguments: [target_address: RawTransactionArgument<string | null>];
	}) {
		const argumentsTypes = [
			'0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<address>',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'new_leaf',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Set data as a vec_map directly overriding the data set in the registration self.
	 * This simplifies the editing flow and gives the user and clients a fine-grained
	 * control over custom data.
	 *
	 * Here's a meta example of how a PTB would look like:
	 *
	 * ```
	 * let record = moveCall('data', [domain_name]);
	 * moveCall('vec_map::insert', [record.data, key, value]);
	 * moveCall('vec_map::remove', [record.data, other_key]);
	 * moveCall('set_data', [domain_name, record.data]);
	 * ```
	 */
	function set_data(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::name_record::NameRecord`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'set_data',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Set the `target_address` field of the `NameRecord`. */
	function set_target_address(options: {
		arguments: [
			self: RawTransactionArgument<string>,
			new_address: RawTransactionArgument<string | null>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::name_record::NameRecord`,
			'0x0000000000000000000000000000000000000000000000000000000000000001::option::Option<address>',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'set_target_address',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_expiration_timestamp_ms(options: {
		arguments: [
			self: RawTransactionArgument<string>,
			expiration_timestamp_ms: RawTransactionArgument<number | bigint>,
		];
	}) {
		const argumentsTypes = [`${packageAddress}::name_record::NameRecord`, 'u64'] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'set_expiration_timestamp_ms',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Check if the record has expired. */
	function has_expired(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::name_record::NameRecord`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'has_expired',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Check if the record has expired, taking into account the grace period. */
	function has_expired_past_grace_period(options: {
		arguments: [self: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [`${packageAddress}::name_record::NameRecord`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'has_expired_past_grace_period',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Checks whether a name_record is a `leaf` record. */
	function is_leaf_record(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::name_record::NameRecord`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'is_leaf_record',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Read the `data` field from the `NameRecord`. */
	function data(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::name_record::NameRecord`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'data',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Read the `target_address` field from the `NameRecord`. */
	function target_address(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::name_record::NameRecord`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'target_address',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Read the `nft_id` field from the `NameRecord`. */
	function nft_id(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::name_record::NameRecord`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'nft_id',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Read the `expiration_timestamp_ms` field from the `NameRecord`. */
	function expiration_timestamp_ms(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::name_record::NameRecord`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'name_record',
				function: 'expiration_timestamp_ms',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return {
		_new,
		new_leaf,
		set_data,
		set_target_address,
		set_expiration_timestamp_ms,
		has_expired,
		has_expired_past_grace_period,
		is_leaf_record,
		data,
		target_address,
		nft_id,
		expiration_timestamp_ms,
	};
}
