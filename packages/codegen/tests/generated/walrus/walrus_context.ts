/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import * as vec_map from './deps/sui/vec_map.js';
export function WalrusContext() {
	return bcs.struct('WalrusContext', {
		epoch: bcs.u32(),
		committee_selected: bcs.bool(),
		committee: vec_map.VecMap(bcs.Address, bcs.vector(bcs.u16())),
	});
}
