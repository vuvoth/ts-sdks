// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * Admin features of the SuiNS application. Meant to be called directly by the
 * suins admin.
 */

import { bcs } from '@mysten/sui/bcs';
import type { Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments } from '../utils/index.js';
import type { RawTransactionArgument } from '../utils/index.js';
export function Admin() {
	return bcs.struct('Admin', {
		dummy_field: bcs.bool(),
	});
}
export function init(packageAddress: string) {
	/**
	 * Authorize the admin application in the SuiNS to get access to protected
	 * functions. Must be called in order to use the rest of the functions.
	 */
	function authorize(options: {
		arguments: [cap: RawTransactionArgument<string>, suins: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::suins::AdminCap`,
			`${packageAddress}::suins::SuiNS`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'admin',
				function: 'authorize',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Reserve a `domain` in the `SuiNS`. */
	function reserve_domain(options: {
		arguments: [
			_: RawTransactionArgument<string>,
			suins: RawTransactionArgument<string>,
			domain_name: RawTransactionArgument<string>,
			no_years: RawTransactionArgument<number>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::suins::AdminCap`,
			`${packageAddress}::suins::SuiNS`,
			'0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
			'u8',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'admin',
				function: 'reserve_domain',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return { authorize, reserve_domain };
}
