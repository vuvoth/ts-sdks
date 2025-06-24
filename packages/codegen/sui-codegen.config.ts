// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { SuiCodegenConfig } from './src/config.js';

const config: SuiCodegenConfig = {
	output: './tests/generated',
	packages: [
		{
			path: './tests/move/subsidies',
		},
		{
			path: './tests/move/wal',
		},
		{
			path: './tests/move/wal_exchange',
		},
		{
			path: './tests/move/walrus',
		},
	],
};

export default config;
