// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { toBase64, toHex } from '@mysten/bcs';
import { bcs } from '@mysten/sui/bcs';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

import { generateSecretKey, toPublicKey } from './elgamal.js';

const RequestFormat = bcs.struct('RequestFormat', {
	ptb: bcs.string(),
	enc_key: bcs.vector(bcs.U8),
});

export type Certificate = {
	session_vk: string;
	creation_time: number;
	ttl_min: number;
	signature: string;
};

export class SessionKey {
	private packageId: Uint8Array;
	private creationTime: number;
	private ttlMin: number;
	private session_key: Ed25519Keypair;
	private personalMessageSignature: string;

	constructor(packageId: Uint8Array, ttlMin: number) {
		this.packageId = packageId;
		this.creationTime = Date.now();
		this.ttlMin = ttlMin;
		this.session_key = Ed25519Keypair.generate();
		this.personalMessageSignature = '';
	}

	getPersonalMessage(): Uint8Array {
		// TODO: decide if we want 0x on the server end
		const message = `Requesting access to keys of package ${toHex(this.packageId)} for ${this.ttlMin} mins, session key ${toBase64(this.session_key.getPublicKey().toRawBytes())}, created at ${this.creationTime}`;
		return new TextEncoder().encode(message);
	}

	setPersonalMessageSignature(personalMessageSignature: string) {
		this.personalMessageSignature = personalMessageSignature;
	}

	getCertificate(): Certificate {
		if (this.personalMessageSignature === '') {
			throw new Error('Personal message signature is not set');
		}
		return {
			session_vk: toBase64(this.session_key.getPublicKey().toRawBytes()),
			creation_time: this.creationTime,
			ttl_min: this.ttlMin,
			signature: this.personalMessageSignature,
		};
	}

	async createRequestParams(
		txBytes: Uint8Array,
	): Promise<{ decryption_key: Uint8Array; request_signature: string }> {
		let eg_sk = generateSecretKey();
		const msgToSign = RequestFormat.serialize({
			ptb: toBase64(txBytes.slice(1)),
			enc_key: toPublicKey(eg_sk),
		}).toBytes();
		return {
			decryption_key: eg_sk,
			request_signature: toBase64(await this.session_key.sign(msgToSign)),
		};
	}
}
