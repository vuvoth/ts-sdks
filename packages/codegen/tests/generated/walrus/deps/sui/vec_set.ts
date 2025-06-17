/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { bcs, type BcsType } from '@mysten/sui/bcs';
/**
 * A set data structure backed by a vector. The set is guaranteed not to contain
 * duplicate keys. All operations are O(N) in the size of the set
 *
 * - the intention of this data structure is only to provide the convenience of
 *   programming against a set API. Sets that need sorted iteration rather than
 *   insertion order iteration should be handwritten.
 */
export function VecSet<K extends BcsType<any>>(...typeParameters: [K]) {
	return bcs.struct('VecSet', {
		contents: bcs.vector(typeParameters[0]),
	});
}
