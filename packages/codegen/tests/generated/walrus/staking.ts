/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import * as object from './deps/sui/object.js';
export function Staking() {
	return bcs.struct('Staking', {
		id: object.UID(),
		version: bcs.u64(),
		package_id: bcs.Address,
		new_package_id: bcs.option(bcs.Address),
	});
}
export function init(packageAddress: string) {
	function register_candidate(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number[]>,
			RawTransactionArgument<number[]>,
			RawTransactionArgument<number[]>,
			RawTransactionArgument<number>,
			RawTransactionArgument<number | bigint>,
			RawTransactionArgument<number | bigint>,
			RawTransactionArgument<number | bigint>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			'0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
			'0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
			`${packageAddress}::node_metadata::NodeMetadata`,
			'vector<u8>',
			'vector<u8>',
			'vector<u8>',
			'u16',
			'u64',
			'u64',
			'u64',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'register_candidate',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_next_commission(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
			'u16',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_next_commission',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function collect_commission(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::auth::Authenticated`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'collect_commission',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_commission_receiver(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::auth::Authenticated`,
			`${packageAddress}::auth::Authorized`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_commission_receiver',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_governance_authorized(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::auth::Authenticated`,
			`${packageAddress}::auth::Authorized`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_governance_authorized',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function compute_next_committee(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staking::Staking`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'compute_next_committee',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_storage_price_vote(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number | bigint>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
			'u64',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_storage_price_vote',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_write_price_vote(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number | bigint>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
			'u64',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_write_price_vote',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_node_capacity_vote(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number | bigint>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
			'u64',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_node_capacity_vote',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function node_metadata(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staking::Staking`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'node_metadata',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_next_public_key(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number[]>,
			RawTransactionArgument<number[]>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
			'vector<u8>',
			'vector<u8>',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_next_public_key',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_name(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
			'0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_name',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_network_address(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
			'0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_network_address',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_network_public_key(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number[]>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
			'vector<u8>',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_network_public_key',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function set_node_metadata(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
			`${packageAddress}::node_metadata::NodeMetadata`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'set_node_metadata',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function voting_end(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staking::Staking`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'voting_end',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function initiate_epoch_change(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::system::System`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'initiate_epoch_change',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function epoch_sync_done(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
			'u32',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'epoch_sync_done',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function stake_with_pool(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staking::Staking`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'stake_with_pool',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function request_withdraw_stake(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::staked_wal::StakedWal`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'request_withdraw_stake',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function withdraw_stake(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::staked_wal::StakedWal`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'withdraw_stake',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function try_join_active_set(options: {
		arguments: [RawTransactionArgument<string>, RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::storage_node::StorageNodeCap`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'try_join_active_set',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function epoch(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::staking::Staking`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'epoch',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function calculate_rewards(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<number | bigint>,
			RawTransactionArgument<number>,
			RawTransactionArgument<number>,
		];
	}) {
		const argumentsTypes = [`${packageAddress}::staking::Staking`, 'u64', 'u32', 'u32'];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'staking',
				function: 'calculate_rewards',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return {
		register_candidate,
		set_next_commission,
		collect_commission,
		set_commission_receiver,
		set_governance_authorized,
		compute_next_committee,
		set_storage_price_vote,
		set_write_price_vote,
		set_node_capacity_vote,
		node_metadata,
		set_next_public_key,
		set_name,
		set_network_address,
		set_network_public_key,
		set_node_metadata,
		voting_end,
		initiate_epoch_change,
		epoch_sync_done,
		stake_with_pool,
		request_withdraw_stake,
		withdraw_stake,
		try_join_active_set,
		epoch,
		calculate_rewards,
	};
}
