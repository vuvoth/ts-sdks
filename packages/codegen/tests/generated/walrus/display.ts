/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
import * as object from './deps/sui/object.js';
import * as object_bag from './deps/sui/object_bag.js';
export function ObjectDisplay() {
	return bcs.struct('ObjectDisplay', {
		id: object.UID(),
		inner: object_bag.ObjectBag(),
	});
}
export function PublisherKey() {
	return bcs.struct('PublisherKey', {
		dummy_field: bcs.bool(),
	});
}
