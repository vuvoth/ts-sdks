/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/

/** Generic Move and native functions for group operations. */

import { bcs } from '@mysten/sui/bcs';
export function Element() {
	return bcs.struct('Element', {
		bytes: bcs.vector(bcs.u8()),
	});
}
