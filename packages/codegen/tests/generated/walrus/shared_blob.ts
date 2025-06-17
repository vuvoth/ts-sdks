/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import * as object from './deps/sui/object.js';
import * as blob from './blob.js';
import * as balance from './deps/sui/balance.js';
export function SharedBlob() {
	return bcs.struct('SharedBlob', {
		id: object.UID(),
		blob: blob.Blob(),
		funds: balance.Balance(),
	});
}
export function init(packageAddress: string) {
	/** Shares the provided `blob` as a `SharedBlob` with zero funds. */
	function _new(options: { arguments: [blob: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::blob::Blob`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'shared_blob',
				function: 'new',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Shares the provided `blob` as a `SharedBlob` with funds. */
	function new_funded(options: { arguments: [blob: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::blob::Blob`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'shared_blob',
				function: 'new_funded',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Adds the provided `Coin` to the stored funds. */
	function fund(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::shared_blob::SharedBlob`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'shared_blob',
				function: 'fund',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Extends the lifetime of the wrapped `Blob` by `extended_epochs` epochs if the
	 * stored funds are sufficient and the new lifetime does not exceed the maximum
	 * lifetime.
	 */
	function extend(options: {
		arguments: [
			self: RawTransactionArgument<string>,
			system: RawTransactionArgument<string>,
			extended_epochs: RawTransactionArgument<number>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::shared_blob::SharedBlob`,
			`${packageAddress}::system::System`,
			'u32',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'shared_blob',
				function: 'extend',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return { _new, new_funded, fund, extend };
}
