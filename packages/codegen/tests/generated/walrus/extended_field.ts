/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs, type BcsType } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import * as object from './deps/sui/object.js';
export function ExtendedField() {
	return bcs.struct('ExtendedField', {
		id: object.UID(),
	});
}
export function Key() {
	return bcs.struct('Key', {
		dummy_field: bcs.bool(),
	});
}
export function init(packageAddress: string) {
	function _new<T extends BcsType<any>>(options: {
		arguments: [RawTransactionArgument<T>];
		typeArguments: [string];
	}) {
		const argumentsTypes = [`${options.typeArguments[0]}`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'extended_field',
				function: 'new',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
				typeArguments: options.typeArguments,
			});
	}
	function borrow(options: {
		arguments: [RawTransactionArgument<string>];
		typeArguments: [string];
	}) {
		const argumentsTypes = [
			`${packageAddress}::extended_field::ExtendedField<${options.typeArguments[0]}>`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'extended_field',
				function: 'borrow',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
				typeArguments: options.typeArguments,
			});
	}
	function borrow_mut(options: {
		arguments: [RawTransactionArgument<string>];
		typeArguments: [string];
	}) {
		const argumentsTypes = [
			`${packageAddress}::extended_field::ExtendedField<${options.typeArguments[0]}>`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'extended_field',
				function: 'borrow_mut',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
				typeArguments: options.typeArguments,
			});
	}
	function swap<T extends BcsType<any>>(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<T>];
		typeArguments: [string];
	}) {
		const argumentsTypes = [
			`${packageAddress}::extended_field::ExtendedField<${options.typeArguments[0]}>`,
			`${options.typeArguments[0]}`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'extended_field',
				function: 'swap',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
				typeArguments: options.typeArguments,
			});
	}
	function destroy(options: {
		arguments: [RawTransactionArgument<string>];
		typeArguments: [string];
	}) {
		const argumentsTypes = [
			`${packageAddress}::extended_field::ExtendedField<${options.typeArguments[0]}>`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'extended_field',
				function: 'destroy',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
				typeArguments: options.typeArguments,
			});
	}
	return { _new, borrow, borrow_mut, swap, destroy };
}
