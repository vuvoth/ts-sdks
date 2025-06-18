// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * Module to wrap all constants used across the project. A singleton and not meant
 * to be modified (only extended).
 *
 * This module is free from any non-framework dependencies and serves as a single
 * place of storing constants and proving convenient APIs for reading.
 */

import type { Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments } from '../utils/index.js';
export function init(packageAddress: string) {
	/** Top level domain for SUI as a String. */
	function sui_tld(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'sui_tld',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Default value for the image_url. */
	function default_image(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'default_image',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** The amount of MIST in 1 SUI. */
	function mist_per_sui(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'mist_per_sui',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** The minimum length of a domain name. */
	function min_domain_length(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'min_domain_length',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** The maximum length of a domain name. */
	function max_domain_length(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'max_domain_length',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Maximum value for basis points. */
	function max_bps(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'max_bps',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** The amount of milliseconds in a year. */
	function year_ms(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'year_ms',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Grace period in milliseconds after which the domain expires. */
	function grace_period_ms(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'grace_period_ms',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Subdomain constants The NameRecord key that a subdomain can create child names. */
	function subdomain_allow_creation_key(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'subdomain_allow_creation_key',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** The NameRecord key that a subdomain can self-renew. */
	function subdomain_allow_extension_key(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'subdomain_allow_extension_key',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** A getter for a leaf name record's expiration timestamp. */
	function leaf_expiration_timestamp(options: { arguments: [] }) {
		const argumentsTypes = [] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'constants',
				function: 'leaf_expiration_timestamp',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return {
		sui_tld,
		default_image,
		mist_per_sui,
		min_domain_length,
		max_domain_length,
		max_bps,
		year_ms,
		grace_period_ms,
		subdomain_allow_creation_key,
		subdomain_allow_extension_key,
		leaf_expiration_timestamp,
	};
}
