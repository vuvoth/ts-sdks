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
	function _new(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::blob::Blob`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'shared_blob',
				function: 'new',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function new_funded(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::blob::Blob`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'shared_blob',
				function: 'new_funded',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function fund(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::shared_blob::SharedBlob`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'shared_blob',
				function: 'fund',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function extend(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number>,
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
