/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/

/**
 * A storable handler for Balances in general. Is used in the `Coin` module to
 * allow balance operations and can be used to implement custom coins with `Supply`
 * and `Balance`s.
 */

import { bcs } from '@mysten/sui/bcs';
export function Supply() {
	return bcs.struct('Supply', {
		value: bcs.u64(),
	});
}
export function Balance() {
	return bcs.struct('Balance', {
		value: bcs.u64(),
	});
}
