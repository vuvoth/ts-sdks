/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import * as vec_set from './deps/sui/vec_set.js';
import * as object from './deps/sui/object.js';
import * as _package from './deps/sui/package.js';
import * as table from './deps/sui/table.js';
export function PackageDigest() {
	return bcs.struct('PackageDigest', {
		pos0: bcs.vector(bcs.u8()),
	});
}
export function UpgradeProposal() {
	return bcs.struct('UpgradeProposal', {
		epoch: bcs.u32(),
		digest: PackageDigest(),
		version: bcs.u64(),
		voting_weight: bcs.u16(),
		voters: vec_set.VecSet(bcs.Address),
	});
}
export function UpgradeManager() {
	return bcs.struct('UpgradeManager', {
		id: object.UID(),
		cap: _package.UpgradeCap(),
		upgrade_proposals: table.Table(),
	});
}
export function EmergencyUpgradeCap() {
	return bcs.struct('EmergencyUpgradeCap', {
		id: object.UID(),
		upgrade_manager_id: bcs.Address,
	});
}
export function init(packageAddress: string) {
	function vote_for_upgrade(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number[]>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::upgrade::UpgradeManager`,
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::auth::Authenticated`,
			'vector<u8>',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'upgrade',
				function: 'vote_for_upgrade',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function authorize_upgrade(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number[]>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::upgrade::UpgradeManager`,
			`${packageAddress}::staking::Staking`,
			'vector<u8>',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'upgrade',
				function: 'authorize_upgrade',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function authorize_emergency_upgrade(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number[]>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::upgrade::UpgradeManager`,
			`${packageAddress}::upgrade::EmergencyUpgradeCap`,
			'vector<u8>',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'upgrade',
				function: 'authorize_emergency_upgrade',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function commit_upgrade(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::upgrade::UpgradeManager`,
			`${packageAddress}::staking::Staking`,
			`${packageAddress}::system::System`,
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'upgrade',
				function: 'commit_upgrade',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function cleanup_upgrade_proposals(options: {
		arguments: [
			RawTransactionArgument<string>,
			RawTransactionArgument<string>,
			RawTransactionArgument<number[][]>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::upgrade::UpgradeManager`,
			`${packageAddress}::staking::Staking`,
			'vector<vector<u8>>',
		];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'upgrade',
				function: 'cleanup_upgrade_proposals',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function burn_emergency_upgrade_cap(options: { arguments: [RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::upgrade::EmergencyUpgradeCap`];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'upgrade',
				function: 'burn_emergency_upgrade_cap',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return {
		vote_for_upgrade,
		authorize_upgrade,
		authorize_emergency_upgrade,
		commit_upgrade,
		cleanup_upgrade_proposals,
		burn_emergency_upgrade_cap,
	};
}
