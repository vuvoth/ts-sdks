/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import * as object from './deps/sui/object.js';
import * as balance from './deps/sui/balance.js';
export function StakedWal() {
	return bcs.struct('StakedWal', {
		id: object.UID(),
		state: StakedWalState(),
		node_id: bcs.Address,
		principal: balance.Balance(),
		activation_epoch: bcs.u32(),
	});
}
export function StakedWalState() {
	return bcs.enum('StakedWalState', {
		Staked: null,
		Withdrawing: bcs.u32(),
	});
}
export function init(packageAddress: string) {
	function node_id(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staked_wal::StakedWal`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staked_wal',
				function: 'node_id',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function value(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staked_wal::StakedWal`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staked_wal',
				function: 'value',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function activation_epoch(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staked_wal::StakedWal`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staked_wal',
				function: 'activation_epoch',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function is_staked(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staked_wal::StakedWal`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staked_wal',
				function: 'is_staked',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function is_withdrawing(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staked_wal::StakedWal`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staked_wal',
				function: 'is_withdrawing',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function withdraw_epoch(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staked_wal::StakedWal`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staked_wal',
				function: 'withdraw_epoch',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function join(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staked_wal::StakedWal`,
			`${packageAddress}::staked_wal::StakedWal`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staked_wal',
				function: 'join',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function split(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<number | bigint>];
	}) {
		const argumentsTypes = [`${packageAddress}::staked_wal::StakedWal`, 'u64'];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staked_wal',
				function: 'split',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return {
		node_id,
		value,
		activation_epoch,
		is_staked,
		is_withdrawing,
		withdraw_epoch,
		join,
		split,
	};
}
