/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import * as object from './object.js';
export function ObjectTable() {
	return bcs.struct('ObjectTable', {
		id: object.UID(),
		size: bcs.u64(),
	});
}
