// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * Handles creation of the `SuinsRegistration`s. Separates the logic of creating a
 * `SuinsRegistration`. New `SuinsRegistration`s can be created only by the
 * `registry` and this module is tightly coupled with it.
 *
 * When reviewing the module, make sure that:
 *
 * - mutable functions can't be called directly by the owner
 * - all getters are public and take an immutable reference
 */

import { bcs } from '@mysten/sui/bcs';
import type { Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments } from '../utils/index.js';
import type { RawTransactionArgument } from '../utils/index.js';
import * as object from './deps/sui/object.js';
import * as domain from './domain.js';
export function SuinsRegistration() {
	return bcs.struct('SuinsRegistration', {
		id: object.UID(),
		/** The parsed domain. */
		domain: domain.Domain(),
		/** The domain name that the NFT is for. */
		domain_name: bcs.string(),
		/** Timestamp in milliseconds when this NFT expires. */
		expiration_timestamp_ms: bcs.u64(),
		/** Short IPFS hash of the image to be displayed for the NFT. */
		image_url: bcs.string(),
	});
}
export function init(packageAddress: string) {
	/**
	 * Check whether the `SuinsRegistration` has expired by comparing the expiration
	 * timeout with the current time.
	 */
	function has_expired(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'suins_registration',
				function: 'has_expired',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Check whether the `SuinsRegistration` has expired by comparing the expiration
	 * timeout with the current time. This function also takes into account the grace
	 * period.
	 */
	function has_expired_past_grace_period(options: {
		arguments: [self: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'suins_registration',
				function: 'has_expired_past_grace_period',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Get the `domain` field of the `SuinsRegistration`. */
	function domain(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'suins_registration',
				function: 'domain',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Get the `domain_name` field of the `SuinsRegistration`. */
	function domain_name(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'suins_registration',
				function: 'domain_name',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Get the `expiration_timestamp_ms` field of the `SuinsRegistration`. */
	function expiration_timestamp_ms(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'suins_registration',
				function: 'expiration_timestamp_ms',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Get the `image_url` field of the `SuinsRegistration`. */
	function image_url(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'suins_registration',
				function: 'image_url',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function uid(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'suins_registration',
				function: 'uid',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Get the mutable `id` field of the `SuinsRegistration`. */
	function uid_mut(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'suins_registration',
				function: 'uid_mut',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return {
		has_expired,
		has_expired_past_grace_period,
		domain,
		domain_name,
		expiration_timestamp_ms,
		image_url,
		uid,
		uid_mut,
	};
}
