// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { SignatureWithBytes } from '@mysten/sui/cryptography';
import { Signer } from '@mysten/sui/cryptography';
import type { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import type { ZkLoginSignatureInputs } from '@mysten/sui/zklogin';
import { getZkLoginSignature, ZkLoginPublicIdentifier } from '@mysten/sui/zklogin';

export class EnokiPublicKey extends ZkLoginPublicIdentifier {}

export class EnokiKeypair extends Signer {
	#proof: ZkLoginSignatureInputs;
	#maxEpoch: number;
	#ephemeralKeypair: Ed25519Keypair;
	#publicKey: EnokiPublicKey;

	constructor(input: {
		address: string;
		maxEpoch: number;
		proof: ZkLoginSignatureInputs;
		ephemeralKeypair: Ed25519Keypair;
	}) {
		super();
		this.#proof = input.proof;
		this.#maxEpoch = input.maxEpoch;
		this.#ephemeralKeypair = input.ephemeralKeypair;
		this.#publicKey = EnokiPublicKey.fromProof(input.address, input.proof);
	}

	async sign(data: Uint8Array) {
		return this.#ephemeralKeypair.sign(data);
	}

	async signPersonalMessage(bytes: Uint8Array): Promise<SignatureWithBytes> {
		const { bytes: signedBytes, signature: userSignature } =
			await this.#ephemeralKeypair.signPersonalMessage(bytes);

		const zkSignature = getZkLoginSignature({
			inputs: this.#proof,
			maxEpoch: this.#maxEpoch,
			userSignature,
		});

		return {
			bytes: signedBytes,
			signature: zkSignature,
		};
	}

	async signTransaction(bytes: Uint8Array): Promise<SignatureWithBytes> {
		const { bytes: signedBytes, signature: userSignature } =
			await this.#ephemeralKeypair.signTransaction(bytes);

		const zkSignature = getZkLoginSignature({
			inputs: this.#proof,
			maxEpoch: this.#maxEpoch,
			userSignature,
		});

		return {
			bytes: signedBytes,
			signature: zkSignature,
		};
	}

	getKeyScheme() {
		return this.#ephemeralKeypair.getKeyScheme();
	}

	getPublicKey() {
		return this.#publicKey;
	}
}
