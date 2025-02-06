// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { toHex } from '@mysten/bcs';
import type { Fp2, Fp12 } from '@noble/curves/abstract/tower';
import type { ProjPointType } from '@noble/curves/abstract/weierstrass';
import { bls12_381 } from '@noble/curves/bls12-381';

export class G1Element {
	point: ProjPointType<bigint>;

	constructor(point: ProjPointType<bigint>) {
		this.point = point;
	}

	static generator(): G1Element {
		return new G1Element(bls12_381.G1.ProjectivePoint.BASE);
	}

	static fromBytes(bytes: Uint8Array): G1Element {
		return new G1Element(bls12_381.G1.ProjectivePoint.fromHex(toHex(bytes)));
	}

	toBytes(): Uint8Array {
		return this.point.toRawBytes();
	}

	multiply(scalar: Scalar): G1Element {
		return new G1Element(this.point.multiply(scalar.scalar));
	}

	add(other: G1Element): G1Element {
		return new G1Element(this.point.add(other.point));
	}

	subtract(other: G1Element): G1Element {
		return new G1Element(this.point.subtract(other.point));
	}

	static hashToCurve(data: Uint8Array): G1Element {
		return new G1Element(
			bls12_381.G1.ProjectivePoint.fromAffine(bls12_381.G1.hashToCurve(data).toAffine()),
		);
	}

	pairing(other: G2Element): GTElement {
		return new GTElement(bls12_381.pairing(this.point, other.point));
	}
}

export class G2Element {
	point: ProjPointType<Fp2>;

	constructor(point: ProjPointType<Fp2>) {
		this.point = point;
	}

	static generator(): G2Element {
		return new G2Element(bls12_381.G2.ProjectivePoint.BASE);
	}

	static fromBytes(bytes: Uint8Array): G2Element {
		return new G2Element(bls12_381.G2.ProjectivePoint.fromHex(toHex(bytes)));
	}

	toBytes(): Uint8Array {
		return this.point.toRawBytes();
	}

	multiply(scalar: Scalar): G2Element {
		return new G2Element(this.point.multiply(scalar.scalar));
	}

	add(other: G2Element): G2Element {
		return new G2Element(this.point.add(other.point));
	}

	hashToCurve(data: Uint8Array): G2Element {
		return new G2Element(
			bls12_381.G2.ProjectivePoint.fromAffine(bls12_381.G2.hashToCurve(data).toAffine()),
		);
	}
}

export class GTElement {
	element: Fp12;

	constructor(element: Fp12) {
		this.element = element;
	}

	toBytes(): Uint8Array {
		return bls12_381.fields.Fp12.toBytes(this.element);
	}
}

export class Scalar {
	scalar: bigint;

	constructor(scalar: bigint) {
		this.scalar = scalar;
	}

	static random(): Scalar {
		return Scalar.fromBytes(bls12_381.utils.randomPrivateKey());
	}

	toBytes(): Uint8Array {
		return new Uint8Array(bls12_381.fields.Fr.toBytes(this.scalar));
	}

	static fromBytes(bytes: Uint8Array): Scalar {
		return new Scalar(bls12_381.fields.Fr.fromBytes(bytes));
	}

	static fromNumber(num: number): Scalar {
		return new Scalar(BigInt(num));
	}
}
