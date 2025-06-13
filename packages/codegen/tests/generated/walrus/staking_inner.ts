/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import * as object_table from './deps/sui/object_table.js';
import * as extended_field from './extended_field.js';
import * as committee from './committee.js';
import * as epoch_parameters from './epoch_parameters.js';
export function StakingInnerV1() {
	return bcs.struct('StakingInnerV1', {
		n_shards: bcs.u16(),
		epoch_duration: bcs.u64(),
		first_epoch_start: bcs.u64(),
		pools: object_table.ObjectTable(),
		epoch: bcs.u32(),
		active_set: extended_field.ExtendedField(),
		next_committee: bcs.option(committee.Committee()),
		committee: committee.Committee(),
		previous_committee: committee.Committee(),
		next_epoch_params: bcs.option(epoch_parameters.EpochParams()),
		epoch_state: EpochState(),
		next_epoch_public_keys: extended_field.ExtendedField(),
	});
}
export function EpochState() {
	return bcs.enum('EpochState', {
		EpochChangeSync: bcs.u16(),
		EpochChangeDone: bcs.u64(),
		NextParamsSelected: bcs.u64(),
	});
}
