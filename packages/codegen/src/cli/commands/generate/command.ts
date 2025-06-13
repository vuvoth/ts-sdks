// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { buildCommand } from '@stricli/core';

export const generateCommand = buildCommand({
	loader: async () => (await import('./impl')).generate,
	parameters: {
		flags: {
			outputDir: {
				kind: 'parsed',
				parse: String,
				brief: 'Output directory',
			},
			built: {
				kind: 'parsed',
				parse: String,
				variadic: true,
				optional: true,
				brief: 'path to a built move package',
			},
			summary: {
				kind: 'parsed',
				parse: String,
				variadic: true,
				optional: true,
				brief: 'path to a move package with a package_summary',
			},
		},
		aliases: {
			o: 'outputDir',
			b: 'built',
			s: 'summary',
		},
	},
	docs: {
		brief: 'Generate BCS and moveCall helpers from you Move code',
	},
});
