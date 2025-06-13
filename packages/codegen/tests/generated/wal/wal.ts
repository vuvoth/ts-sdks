/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import * as object from './deps/sui/object.js';
export function WAL() {
	return bcs.struct('WAL', {
		dummy_field: bcs.bool(),
	});
}
export function ProtectedTreasury() {
	return bcs.struct('ProtectedTreasury', {
		id: object.UID(),
	});
}
export function TreasuryCapKey() {
	return bcs.struct('TreasuryCapKey', {
		dummy_field: bcs.bool(),
	});
}
export function init(packageAddress: string) {
	function total_supply(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::wal::ProtectedTreasury`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal',
				function: 'total_supply',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function burn(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::wal::ProtectedTreasury`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal',
				function: 'burn',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return { total_supply, burn };
}
