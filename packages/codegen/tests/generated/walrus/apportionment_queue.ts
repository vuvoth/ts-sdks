/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs, type BcsType } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import * as uq64_64 from './deps/std/uq64_64.js';
export function ApportionmentQueue<T extends BcsType<any>>(...typeParameters: [T]) {
	return bcs.struct('ApportionmentQueue', {
		entries: bcs.vector(Entry(typeParameters[0])),
	});
}
export function Entry<T extends BcsType<any>>(...typeParameters: [T]) {
	return bcs.struct('Entry', {
		priority: uq64_64.UQ64_64(),
		tie_breaker: bcs.u64(),
		value: typeParameters[0],
	});
}
export function init(packageAddress: string) {
	function _new(options: { arguments: []; typeArguments: [string] }) {
		const argumentsTypes = [];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'apportionment_queue',
				function: 'new',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
				typeArguments: options.typeArguments,
			});
	}
	function pop_max(options: {
		arguments: [RawTransactionArgument<string>];
		typeArguments: [string];
	}) {
		const argumentsTypes = [
			`${packageAddress}::apportionment_queue::ApportionmentQueue<${options.typeArguments[0]}>`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'apportionment_queue',
				function: 'pop_max',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
				typeArguments: options.typeArguments,
			});
	}
	function insert<T extends BcsType<any>>(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number | bigint>,
			RawTransactionArgument<T>,
		];
		typeArguments: [string];
	}) {
		const argumentsTypes = [
			`${packageAddress}::apportionment_queue::ApportionmentQueue<${options.typeArguments[0]}>`,
			'0x0000000000000000000000000000000000000000000000000000000000000001::uq64_64::UQ64_64',
			'u64',
			`${options.typeArguments[0]}`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'apportionment_queue',
				function: 'insert',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
				typeArguments: options.typeArguments,
			});
	}
	return { _new, pop_max, insert };
}
