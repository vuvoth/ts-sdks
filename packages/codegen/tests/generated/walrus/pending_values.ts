/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import * as vec_map from './deps/sui/vec_map.js';
export function PendingValues() {
	return bcs.struct('PendingValues', {
		pos0: vec_map.VecMap(bcs.u32(), bcs.u64()),
	});
}
