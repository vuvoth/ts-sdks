/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs } from '@mysten/sui/bcs';
export function PoolExchangeRate() {
	return bcs.enum('PoolExchangeRate', {
		Flat: null,
		Variable: bcs.tuple([bcs.u128(), bcs.u128()]),
	});
}
