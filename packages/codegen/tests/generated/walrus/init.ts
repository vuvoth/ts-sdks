/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import * as object from './deps/sui/object.js';
import * as _package from './deps/sui/package.js';
export function INIT() {
	return bcs.struct('INIT', {
		dummy_field: bcs.bool(),
	});
}
export function InitCap() {
	return bcs.struct('InitCap', {
		id: object.UID(),
		publisher: _package.Publisher(),
	});
}
export function init(packageAddress: string) {
	function initialize_walrus(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<number | bigint>,
			RawTransactionArgument<number | bigint>,
			RawTransactionArgument<number>,
			RawTransactionArgument<number>,
		];
	}) {
		const argumentsTypes = [`${packageAddress}::init::InitCap`, 'u64', 'u64', 'u16', 'u32'];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'init',
				function: 'initialize_walrus',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function migrate(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::system::System`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'init',
				function: 'migrate',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return { initialize_walrus, migrate };
}
