// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { LocalContext } from '../../context.js';
import { generateBuiltPackage, generateFromPackageSummary } from '../../../index.js';
import { basename } from 'node:path';

interface SubdirCommandFlags {
	outputDir: string;
	built?: string[];
	summary?: string[];
	noPrune?: boolean;
}

export async function generate(this: LocalContext, flags: SubdirCommandFlags): Promise<void> {
	for (const path of flags.built ?? []) {
		await generateBuiltPackage({
			source: path,
			destination: flags.outputDir,
			name: basename(path),
		});
	}

	for (const path of flags.summary ?? []) {
		await generateFromPackageSummary({
			source: path,
			destination: flags.outputDir,
			name: basename(path),
			noPrune: flags.noPrune,
		});
	}
}
