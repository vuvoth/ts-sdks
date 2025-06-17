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
	/**
	 * Function to initialize walrus and share the system and staking objects. This can
	 * only be called once, after which the `InitCap` is destroyed. TODO: decide what
	 * to add as system parameters instead of constants.
	 */
	function initialize_walrus(options: {
		arguments: [
			init_cap: RawTransactionArgument<string>,
			epoch_zero_duration: RawTransactionArgument<number | bigint>,
			epoch_duration: RawTransactionArgument<number | bigint>,
			n_shards: RawTransactionArgument<number>,
			max_epochs_ahead: RawTransactionArgument<number>,
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
	/**
	 * Migrate the staking and system objects to the new package id.
	 *
	 * This must be called in the new package after an upgrade is committed to emit an
	 * event that informs all storage nodes and prevent previous package versions from
	 * being used.
	 */
	function migrate(options: {
		arguments: [staking: RawTransactionArgument<string>, system: RawTransactionArgument<string>];
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
