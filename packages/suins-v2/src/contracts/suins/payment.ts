// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { bcs } from '@mysten/sui/bcs';
import type { BcsType } from '@mysten/sui/bcs';
import type { Transaction } from '@mysten/sui/transactions';
import { normalizeMoveArguments } from '../utils/index.js';
import type { RawTransactionArgument } from '../utils/index.js';
import * as domain from './domain.js';
import * as vec_map from './deps/sui/vec_map.js';
import * as type_name from './deps/std/type_name.js';
export function RequestData() {
	return bcs.struct('RequestData', {
		/** The version of the payment module. */
		version: bcs.u8(),
		/** The domain for which the payment is being made. */
		domain: domain.Domain(),
		/** The years for which the payment is being made. Defaults to 1 for registration. */
		years: bcs.u8(),
		/** The amount the user has to pay in base units. */
		base_amount: bcs.u64(),
		/**
		 * The discounts (each app can add a key for its discount) to avoid multiple
		 * additions of the same discount.
		 */
		discounts_applied: vec_map.VecMap(bcs.string(), bcs.u64()),
		/**
		 * a metadata field for future-proofness. No use-cases are enabled in the current
		 * release.
		 */
		metadata: vec_map.VecMap(bcs.string(), bcs.string()),
	});
}
export function TransactionEvent() {
	return bcs.struct('TransactionEvent', {
		app: type_name.TypeName(),
		domain: domain.Domain(),
		years: bcs.u8(),
		request_data_version: bcs.u8(),
		base_amount: bcs.u64(),
		discounts_applied: vec_map.VecMap(bcs.string(), bcs.u64()),
		metadata: vec_map.VecMap(bcs.string(), bcs.string()),
		is_renewal: bcs.bool(),
		currency: type_name.TypeName(),
		currency_amount: bcs.u64(),
	});
}
/**
 * The payment intent for a given domain
 *
 * - Registration: The user is registering a new domain.
 * - Renewal: The user is renewing an existing domain.
 */
export function PaymentIntent() {
	return bcs.enum('PaymentIntent', {
		Registration: RequestData(),
		Renewal: RequestData(),
	});
}
/**
 * A receipt that is generated after a successful payment. Can be used to:
 *
 * - Prove that the payment was successful.
 * - Register a new name, or renew an existing one.
 */
export function Receipt() {
	return bcs.enum('Receipt', {
		Registration: bcs.struct('Receipt.Registration', {
			domain: domain.Domain(),
			years: bcs.u8(),
			version: bcs.u8(),
		}),
		Renewal: bcs.struct('Receipt.Renewal', {
			domain: domain.Domain(),
			years: bcs.u8(),
			version: bcs.u8(),
		}),
	});
}
export function init(packageAddress: string) {
	/**
	 * Allow an authorized app to apply a percentage discount to the payment intent.
	 * E.g. an NS payment can apply a 10% discount on top of a user's 20% discount if
	 * allow_multiple_discounts is true
	 */
	function apply_percentage_discount<A extends BcsType<any>>(options: {
		arguments: [
			intent: RawTransactionArgument<string>,
			suins: RawTransactionArgument<string>,
			_: RawTransactionArgument<A>,
			discount_key: RawTransactionArgument<string>,
			discount: RawTransactionArgument<number>,
			allow_multiple_discounts: RawTransactionArgument<boolean>,
		];
		typeArguments: [string];
	}) {
		const argumentsTypes = [
			`${packageAddress}::payment::PaymentIntent`,
			`${packageAddress}::suins::SuiNS`,
			`${options.typeArguments[0]}`,
			'0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
			'u8',
			'bool',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'apply_percentage_discount',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
				typeArguments: options.typeArguments,
			});
	}
	/**
	 * Allow an authorized app to finalize a payment. Returns a receipt that can be
	 * used to register or renew a domain.
	 *
	 * SAFETY: Only authorized packages can call this. We do not check the amount of
	 * funds in this helper. This is the responsibility of the `payments` app.
	 */
	function finalize_payment<A extends BcsType<any>>(options: {
		arguments: [
			intent: RawTransactionArgument<string>,
			suins: RawTransactionArgument<string>,
			app: RawTransactionArgument<A>,
		];
		typeArguments: [string, string];
	}) {
		const argumentsTypes = [
			`${packageAddress}::payment::PaymentIntent`,
			`${packageAddress}::suins::SuiNS`,
			`${options.typeArguments[0]}`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'finalize_payment',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
				typeArguments: options.typeArguments,
			});
	}
	/**
	 * Creates a `PaymentIntent` for registering a new domain. This is a hot-potato and
	 * can only be consumed in a single transaction.
	 */
	function init_registration(options: {
		arguments: [suins: RawTransactionArgument<string>, domain: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::suins::SuiNS`,
			'0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'init_registration',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Creates a `PaymentIntent` for renewing an existing domain. This is a hot-potato
	 * and can only be consumed in a single transaction.
	 */
	function init_renewal(options: {
		arguments: [
			suins: RawTransactionArgument<string>,
			nft: RawTransactionArgument<string>,
			years: RawTransactionArgument<number>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::suins::SuiNS`,
			`${packageAddress}::suins_registration::SuinsRegistration`,
			'u8',
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'init_renewal',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Register a domain with the given receipt. This is a hot-potato and can only be
	 * consumed in a single transaction.
	 */
	function register(options: {
		arguments: [receipt: RawTransactionArgument<string>, suins: RawTransactionArgument<string>];
	}) {
		const argumentsTypes = [
			`${packageAddress}::payment::Receipt`,
			`${packageAddress}::suins::SuiNS`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'register',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/**
	 * Renew a domain with the given receipt. This is a hot-potato and can only be
	 * consumed in a single transaction.
	 */
	function renew(options: {
		arguments: [
			receipt: RawTransactionArgument<string>,
			suins: RawTransactionArgument<string>,
			nft: RawTransactionArgument<string>,
		];
	}) {
		const argumentsTypes = [
			`${packageAddress}::payment::Receipt`,
			`${packageAddress}::suins::SuiNS`,
			`${packageAddress}::suins_registration::SuinsRegistration`,
		] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'renew',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Getters */
	function request_data(options: { arguments: [intent: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::payment::PaymentIntent`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'request_data',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function years(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::payment::RequestData`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'years',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function base_amount(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::payment::RequestData`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'base_amount',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	function domain(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::payment::RequestData`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'domain',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Returns true if at least one discount has been applied to the payment intent. */
	function discount_applied(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::payment::RequestData`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'discount_applied',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** A list of discounts that have been applied to the payment intent. */
	function discounts_applied(options: { arguments: [self: RawTransactionArgument<string>] }) {
		const argumentsTypes = [`${packageAddress}::payment::RequestData`] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'discounts_applied',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	/** Public helper to calculate price after a percentage discount has been applied. */
	function calculate_total_after_discount(options: {
		arguments: [data: RawTransactionArgument<string>, discount: RawTransactionArgument<number>];
	}) {
		const argumentsTypes = [`${packageAddress}::payment::RequestData`, 'u8'] satisfies string[];
		return (tx: Transaction) =>
			tx.moveCall({
				package: packageAddress,
				module: 'payment',
				function: 'calculate_total_after_discount',
				arguments: normalizeMoveArguments(options.arguments, argumentsTypes),
			});
	}
	return {
		apply_percentage_discount,
		finalize_payment,
		init_registration,
		init_renewal,
		register,
		renew,
		request_data,
		years,
		base_amount,
		domain,
		discount_applied,
		discounts_applied,
		calculate_total_after_discount,
	};
}
