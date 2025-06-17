/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/

/** Sui object identifiers */

import { bcs } from '@mysten/sui/bcs';
export function ID() {
	return bcs.struct('ID', {
		bytes: bcs.Address,
	});
}
export function UID() {
	return bcs.struct('UID', {
		id: bcs.Address,
	});
}
