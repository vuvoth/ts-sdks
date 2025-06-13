/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import * as object from './deps/sui/object.js';
import * as balance from './deps/sui/balance.js';
export function Exchange() {
	return bcs.struct('Exchange', {
		id: object.UID(),
		wal: balance.Balance(),
		sui: balance.Balance(),
		rate: ExchangeRate(),
		admin: bcs.Address,
	});
}
export function AdminCap() {
	return bcs.struct('AdminCap', {
		id: object.UID(),
	});
}
export function ExchangeRate() {
	return bcs.struct('ExchangeRate', {
		wal: bcs.u64(),
		sui: bcs.u64(),
	});
}
export function init(packageAddress: string) {
	function new_exchange_rate(options: {
		arguments: [RawTransactionArgument<number | bigint>, RawTransactionArgument<number | bigint>];
	}) {
		const argumentsTypes = ['u64', 'u64'];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'new_exchange_rate',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function _new(options: { arguments: [] }) {
		const argumentsTypes = [];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'new',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function new_funded(options: { arguments: [RawTransactionArgument<number | bigint>] }) {
		const argumentsTypes = ['u64'];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'new_funded',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function add_wal(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<number | bigint>];
	}) {
		const argumentsTypes = [`${packageAddress}::wal_exchange::Exchange`, 'u64'];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'add_wal',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function add_sui(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<number | bigint>];
	}) {
		const argumentsTypes = [`${packageAddress}::wal_exchange::Exchange`, 'u64'];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'add_sui',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function add_all_wal(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::wal_exchange::Exchange`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'add_all_wal',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function add_all_sui(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::wal_exchange::Exchange`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'add_all_sui',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function withdraw_wal(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<number | bigint>,
			RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::wal_exchange::Exchange`,
			'u64',
			`${packageAddress}::wal_exchange::AdminCap`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'withdraw_wal',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function withdraw_sui(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<number | bigint>,
			RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::wal_exchange::Exchange`,
			'u64',
			`${packageAddress}::wal_exchange::AdminCap`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'withdraw_sui',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_exchange_rate(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<number | bigint>,
			RawTransactionArgument<number | bigint>,
			RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::wal_exchange::Exchange`,
			'u64',
			'u64',
			`${packageAddress}::wal_exchange::AdminCap`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'set_exchange_rate',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function exchange_all_for_wal(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::wal_exchange::Exchange`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'exchange_all_for_wal',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function exchange_for_wal(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<number | bigint>];
	}) {
		const argumentsTypes = [`${packageAddress}::wal_exchange::Exchange`, 'u64'];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'exchange_for_wal',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function exchange_all_for_sui(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::wal_exchange::Exchange`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'exchange_all_for_sui',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function exchange_for_sui(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<number | bigint>];
	}) {
		const argumentsTypes = [`${packageAddress}::wal_exchange::Exchange`, 'u64'];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'wal_exchange',
				function: 'exchange_for_sui',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return {
		new_exchange_rate,
		_new,
		new_funded,
		add_wal,
		add_sui,
		add_all_wal,
		add_all_sui,
		withdraw_wal,
		withdraw_sui,
		set_exchange_rate,
		exchange_all_for_wal,
		exchange_for_wal,
		exchange_all_for_sui,
		exchange_for_sui,
	};
}
