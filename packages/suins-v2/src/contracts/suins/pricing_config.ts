// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { bcs } from '@mysten/sui/bcs';
import type { Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments } from '../utils/index.js';
import type { RawTransactionArgument } from '../utils/index.js';
import * as vec_map from './deps/sui/vec_map.js';
export function Range() {
	return bcs.tuple([bcs.u64(), bcs.u64()], { name: 'Range' });
}
export function PricingConfig() {
	return bcs.struct('PricingConfig', {
		pricing: vec_map.VecMap(Range(), bcs.u64()),
	});
}
export function RenewalConfig() {
	return bcs.struct('RenewalConfig', {
		config: PricingConfig(),
	});
}
export function init(packageAddress: string) {
	/**
	 * Calculates the base price for a given length.
	 *
	 * - Base price type is abstracted away. We can switch to a different base. Our
	 *   core base will become USDC.
	 * - The price is calculated based on the length of the domain name and the
	 *   available ranges.
	 */
	function calculate_base_price(options: {
		arguments: [
			config: RawTransactionArgument<string>,
			length: RawTransactionArgument<number | bigint>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::pricing_config::PricingConfig`,
			'u64',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'pricing_config',
				function: 'calculate_base_price',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Creates a new PricingConfig with the given ranges and prices.
	 *
	 * - The ranges should be sorted in `ascending order` and should not overlap.
	 * - The length of the ranges and prices should be the same.
	 *
	 * All the ranges are inclusive (e.g. [3,5]: includes 3, 4, and 5).
	 */
	function _new(options: {
		arguments: [
			ranges: RawTransactionArgument<string[]>,
			prices: RawTransactionArgument<number | bigint[]>,
		];
	}) {
		const argumentsTypes = [
			`vector<${packageAddress}::pricing_config::Range>`,
			'vector<u64>',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'pricing_config',
				function: 'new',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Checks if the value is between the range (inclusive). */
	function is_between_inclusive(options: {
		arguments: [
			range: RawTransactionArgument<string>,
			length: RawTransactionArgument<number | bigint>,
		];
	}) {
		const argumentsTypes = [`${packageAddress}::pricing_config::Range`, 'u64'] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'pricing_config',
				function: 'is_between_inclusive',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Returns the pricing config for usage in external apps. */
	function pricing(options: { arguments: [config: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::pricing_config::PricingConfig`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'pricing_config',
				function: 'pricing',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Constructor for Renewal<T> that initializes it with a PricingConfig. */
	function new_renewal_config(options: { arguments: [config: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::pricing_config::PricingConfig`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'pricing_config',
				function: 'new_renewal_config',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function new_range(options: { arguments: [range: RawTransactionArgument<number | bigint[]>] }) {
		const argumentsTypes = ['vector<u64>'] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'pricing_config',
				function: 'new_range',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function config(options: { arguments: [renewal: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::pricing_config::RenewalConfig`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'pricing_config',
				function: 'config',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return {
		calculate_base_price,
		_new,
		is_between_inclusive,
		pricing,
		new_renewal_config,
		new_range,
		config,
	};
}
