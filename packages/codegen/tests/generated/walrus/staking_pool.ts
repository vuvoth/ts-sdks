/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import * as object from './deps/sui/object.js';
import * as storage_node from './storage_node.js';
import * as pending_values from './pending_values.js';
import * as table from './deps/sui/table.js';
import * as balance from './deps/sui/balance.js';
import * as auth from './auth.js';
import * as bag from './deps/sui/bag.js';
export function VotingParams() {
	return bcs.struct('VotingParams', {
		storage_price: bcs.u64(),
		write_price: bcs.u64(),
		node_capacity: bcs.u64(),
	});
}
export function StakingPool() {
	return bcs.struct('StakingPool', {
		id: object.UID(),
		state: PoolState(),
		voting_params: VotingParams(),
		node_info: storage_node.StorageNodeInfo(),
		activation_epoch: bcs.u32(),
		latest_epoch: bcs.u32(),
		wal_balance: bcs.u64(),
		num_shares: bcs.u64(),
		pending_shares_withdraw: pending_values.PendingValues(),
		pre_active_withdrawals: pending_values.PendingValues(),
		pending_commission_rate: pending_values.PendingValues(),
		commission_rate: bcs.u16(),
		exchange_rates: table.Table(),
		pending_stake: pending_values.PendingValues(),
		rewards_pool: balance.Balance(),
		commission: balance.Balance(),
		commission_receiver: auth.Authorized(),
		governance_authorized: auth.Authorized(),
		extra_fields: bag.Bag(),
	});
}
export function PoolState() {
	return bcs.enum('PoolState', {
		Active: null,
		Withdrawing: bcs.u32(),
		Withdrawn: null,
	});
}
