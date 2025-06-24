// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { buildCommand } from '@stricli/core';

export const generateCommand = buildCommand({
	loader: async () => (await import('./impl.js')).default,
	parameters: {
		positional: {
			kind: 'array',
			parameter: {
				parse: String,
				brief: 'package name, mvr name, or path to a move package',
			},
		},
		flags: {
			outputDir: {
				kind: 'parsed',
				parse: String,
				brief: 'Output directory',
				optional: true,
			},
			noPrune: {
				kind: 'parsed',
				parse: Boolean,
				optional: true,
				brief: 'generate all types and functions in dependencies',
			},
		},
		aliases: {
			o: 'outputDir',
		},
	},
	docs: {
		brief: 'Generate BCS and moveCall helpers from you Move code',
	},
});
