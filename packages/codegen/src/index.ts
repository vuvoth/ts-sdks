// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { MoveModuleBuilder } from './move-module-builder.js';
import { existsSync, statSync } from 'node:fs';

export async function generateBuiltPackage({
	source,
	destination,
	name,
}: {
	source: string;
	destination: string;
	name: string;
}) {
	const modules = (await readdir(join(source, 'build', name, 'bytecode_modules')))
		.map((mod) => join(source, 'build', name, 'bytecode_modules', mod))
		.filter((mod) => mod.endsWith('.mv'));

	const builders = await Promise.all(modules.map((mod) => MoveModuleBuilder.fromBytecodeFile(mod)));

	for (const builder of builders) {
		if (!builder.hasTypesOrFunctions()) {
			continue;
		}

		builder.renderBCSTypes();
		builder.renderFunctions();

		await mkdir(join(destination, name), { recursive: true });
		await writeFile(
			join(destination, `${name}/${builder.summary.id.name}.ts`),
			builder.toString('./', `./${name}/${builder.summary.id.name}.ts`),
		);
	}

	const depsPath = join(source, 'build', name, 'bytecode_modules', 'dependencies');
	const depDirs = await readdir(depsPath);

	for (const dir of depDirs) {
		const modules = await readdir(join(depsPath, dir));

		for (const modFile of modules) {
			const builder = await MoveModuleBuilder.fromBytecodeFile(join(depsPath, dir, modFile));

			if (!builder.hasBcsTypes()) {
				continue;
			}

			const moduleAddress = normalizeSuiAddress(builder.summary.id.address);
			builder.renderBCSTypes();
			await mkdir(join(destination, 'deps', moduleAddress), { recursive: true });
			await writeFile(
				join(destination, 'deps', moduleAddress, `${builder.summary.id.name}.ts`),
				builder.toString('./', `./deps/${moduleAddress}/${builder.summary.id.name}.ts`),
			);
		}
	}
}

export async function generateFromPackageSummary({
	source,
	destination,
	name,
}: {
	source: string;
	destination: string;
	name: string;
}) {
	const summaryDir = join(source, 'package_summaries');

	if (!existsSync(summaryDir)) {
		throw new Error(`Package summary directory not found: ${summaryDir}`);
	}

	const addressMappings: Record<string, string> = JSON.parse(
		await readFile(join(summaryDir, 'address_mapping.json'), 'utf-8'),
	);

	const packages = (await readdir(summaryDir)).filter((file) =>
		statSync(join(summaryDir, file)).isDirectory(),
	);
	const modules = (
		await Promise.all(
			packages.map(async (pkg) => {
				const modules = await readdir(join(summaryDir, pkg));
				return Promise.all(
					modules.map(async (mod) => ({
						package: pkg,
						isMainPackage: pkg === name,
						module: basename(mod, '.json'),
						builder: await MoveModuleBuilder.fromSummaryFile(
							join(summaryDir, pkg, mod),
							addressMappings,
						),
					})),
				);
			}),
		)
	).flat();

	const moduleBuilders = Object.fromEntries(
		modules.map((mod) => [`${mod.package}::${mod.module}`, mod.builder]),
	);

	modules.forEach((mod) => {
		if (mod.isMainPackage) {
			mod.builder.includeAllTypes(moduleBuilders);
		}
	});

	await Promise.all(
		modules.map(async (mod) => {
			if (mod.isMainPackage && mod.builder.hasTypesOrFunctions()) {
				mod.builder.renderBCSTypes();
				mod.builder.renderFunctions();
			} else if (mod.isMainPackage) {
				return;
			} else if (mod.builder.hasBcsTypes()) {
				mod.builder.renderBCSTypes();
			} else {
				return;
			}

			await mkdir(
				mod.isMainPackage ? join(destination, name) : join(destination, name, 'deps', mod.package),
				{ recursive: true },
			);

			await writeFile(
				mod.isMainPackage
					? join(destination, name, `${mod.module}.ts`)
					: join(destination, name, 'deps', mod.package, `${mod.module}.ts`),
				mod.builder.toString(
					'./',
					mod.isMainPackage ? `./${mod.module}.ts` : `./deps/${mod.package}/${mod.module}.ts`,
				),
			);
		}),
	);
}
