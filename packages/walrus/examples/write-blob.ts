// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui/faucet';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { coinWithBalance, Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI } from '@mysten/sui/utils';

import { WalrusClient } from '../src/client.js';

/** @ts-ignore */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const suiClient = new SuiClient({
	url: getFullnodeUrl('testnet'),
});

const walrusClient = new WalrusClient({
	network: 'testnet',
	suiClient,
});

async function uploadFile() {
	const keypair = await getFundedKeypair();

	const file = new TextEncoder().encode('Hello from the TS SDK!!!\n');

	const { blobId } = await walrusClient.writeBlob({
		blob: file,
		deletable: false,
		epochs: 3,
		signer: keypair,
	});

	console.log(blobId);
}

uploadFile();

async function getFundedKeypair() {
	const keypair = Ed25519Keypair.fromSecretKey(
		'suiprivkey1qzmcxscyglnl9hnq82crqsuns0q33frkseks5jw0fye3tuh83l7e6ajfhxx',
	);
	console.log(keypair.toSuiAddress());

	const balance = await suiClient.getBalance({
		owner: keypair.toSuiAddress(),
	});

	if (BigInt(balance.totalBalance) < MIST_PER_SUI) {
		await requestSuiFromFaucetV0({
			host: getFaucetHost('testnet'),
			recipient: keypair.toSuiAddress(),
		});
	}

	const walBalance = await suiClient.getBalance({
		owner: keypair.toSuiAddress(),
		coinType: walrusClient.walType,
	});
	console.log('wal balance:', walBalance.totalBalance);

	if (Number(walBalance.totalBalance) < Number(MIST_PER_SUI) / 2) {
		const tx = new Transaction();

		const wal = tx.moveCall({
			package: walrusClient.packageConfig.exchange!.packageId,
			module: 'wal_exchange',
			function: 'exchange_all_for_wal',
			arguments: [
				tx.object(walrusClient.packageConfig.exchange!.exchangeIds[0]),
				coinWithBalance({
					balance: MIST_PER_SUI / 2n,
				}),
			],
		});

		tx.transferObjects([wal], keypair.toSuiAddress());

		const { digest } = await suiClient.signAndExecuteTransaction({
			transaction: tx,
			signer: keypair,
		});

		await suiClient.waitForTransaction({
			digest,
			options: {
				showEvents: true,
			},
		});
	}

	return keypair;
}
