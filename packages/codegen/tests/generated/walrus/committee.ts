/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import * as vec_map from './deps/sui/vec_map.js';
export function Committee() {
	return bcs.struct('Committee', {
		pos0: vec_map.VecMap(bcs.Address, bcs.vector(bcs.u16())),
	});
}
