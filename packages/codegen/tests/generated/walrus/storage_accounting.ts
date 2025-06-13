/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import * as balance from './deps/sui/balance.js';
export function FutureAccounting() {
	return bcs.struct('FutureAccounting', {
		epoch: bcs.u32(),
		used_capacity: bcs.u64(),
		rewards_to_distribute: balance.Balance(),
	});
}
export function FutureAccountingRingBuffer() {
	return bcs.struct('FutureAccountingRingBuffer', {
		current_index: bcs.u32(),
		length: bcs.u32(),
		ring_buffer: bcs.vector(FutureAccounting()),
	});
}
