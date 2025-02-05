// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { fromBase64, fromHex } from '@mysten/bcs';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	getAllowlistedKeyServers,
	retrieveKeyServers,
	verifyKeyServer,
} from '../../src/key-server.js';

// Data for mock response from SuiClient
const pk = fromBase64(
	'oEC1VIuwQo+6FZiVwHCAy/3HbvAbuIyiztXIWwd4LgmXCh9WhOKg3T0+Mb62y9fqAsSaN5SybG09n/3JnkmEzJgdDXLpM8KvMwkha/cBHp6Cx7aCdogvGLoOp/RadyHb',
);
const id = '0xb35a7228d8cf224ad1e828c0217c95a5153bafc2906d6f9c178197dce26fbcf8';
const keyType = 0;
const url = 'https://seal-key-server-testnet-1.mystenlabs.com';
const name = 'mysten-testnet-1';

describe('key-server tests', () => {
	beforeEach(() => {
		vi.mock('@mysten/sui.js', () => ({
			SuiClient: vi.fn(() => ({
				getObject: vi.fn().mockResolvedValue({
					data: {
						content: {
							fields: {
								id: {
									id,
								},
								name,
								url,
								key_type: keyType,
								pk,
							},
						},
					},
				}),
			})),
		}));
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('test fixed getAllowedlistedKeyServers', async () => {
		// These should be updated when new key servers are added.
		expect(getAllowlistedKeyServers('testnet')).toEqual([
			fromHex('0xb35a7228d8cf224ad1e828c0217c95a5153bafc2906d6f9c178197dce26fbcf8'),
			fromHex('0x2d6cde8a9d9a65bde3b0a346566945a63b4bfb70e9a06c41bdb70807e2502b06'),
		]);
	});

	it('test retrieveKeyServers (mocked)', async () => {
		const keyServers = await retrieveKeyServers({
			objectIds: [fromHex(id)],
			client: new SuiClient({ url: getFullnodeUrl('testnet') }),
		});
		expect(keyServers.length).toEqual(1);
		expect(keyServers[0].objectId).toEqual(fromHex(id));
		expect(keyServers[0].name).toEqual(name);
		expect(keyServers[0].keyType).toEqual(0);
		expect(keyServers[0].url).toEqual(url);
		expect(keyServers[0].pk).toEqual(new Uint8Array(pk));
	});

	it('test verifyKeyServerInfo (mocked)', async () => {
		// Mock fetch with exact response from the real service
		const keyServers = await retrieveKeyServers({
			objectIds: [fromHex(id)],
			client: new SuiClient({ url: getFullnodeUrl('testnet') }),
		});
		vi.clearAllMocks();
		global.fetch = vi.fn().mockImplementation(() => {
			return Promise.resolve({
				ok: true,
				status: 200,
				json: () =>
					Promise.resolve({
						service_id: id, // Note: the actual response uses the hex string format
						pop: 'iDsj79BrG4PplI8oxRR3OUS6STJkC1ffoljGwSlk2BWib4ovohsk2/irjkqdOEkF',
					}),
			});
		});

		expect(verifyKeyServer(keyServers[0])).toBeTruthy();
	});
});
