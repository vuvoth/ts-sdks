/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
export function EpochParams() {
	return bcs.struct('EpochParams', {
		total_capacity_size: bcs.u64(),
		storage_price_per_unit_size: bcs.u64(),
		write_price_per_unit_size: bcs.u64(),
	});
}
