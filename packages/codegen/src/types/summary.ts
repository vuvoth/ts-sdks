// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

export interface ModuleSummary {
	doc?: string | null;
	immediate_dependencies: {
		address: string;
		name: string;
	}[];
	attributes?: Attribute[];
	functions: Record<string, FunctionSummary>;
	structs: Record<string, StructSummary>;
	enums: Record<string, EnumSummary>;
}

export type Attribute =
	| {
			Name: string;
	  }
	| {
			Assigned: [string, string];
	  }
	| {
			Parameterized: [string, Attribute[]];
	  };

export interface FunctionSummary {
	source_index?: number;
	index: number;
	doc?: string | null;
	attributes?: Attribute[];
	visibility: FunctionVisibility;
	entry: boolean;
	_macro?: boolean;
	type_parameters: DatatypeParameter[];
	parameters: Parameter[];
	return_: Type[];
}

export interface StructSummary {
	index: number;
	doc?: string | null;
	attributes?: Attribute[];
	abilities: Ability[];
	type_parameters: DatatypeParameter[];
	fields: Fields;
}

export interface EnumSummary {
	index: number;
	doc?: string | null;
	attributes?: Attribute[];
	abilities: Ability[];
	type_parameters: TypeParameter[];
	variants: Record<string, Variant>;
}

export interface Variant {
	index: number;
	doc?: string | null;
	fields: Fields;
}

export interface Fields {
	positional_fields: boolean;
	fields: Record<string, Field>;
}

export interface Field {
	index: number;
	doc?: string | null;
	type_: Type;
}

export interface TypeParameter {
	name?: string;
	constraints: Ability[];
}

export interface DatatypeParameter extends TypeParameter {
	phantom: boolean;
}

export type Ability = 'Drop' | 'Copy' | 'Key' | 'Store';

export interface Parameter {
	name?: string;
	type_: Type;
}

export type Type =
	| 'bool'
	| 'u8'
	| 'u16'
	| 'u32'
	| 'u64'
	| 'u128'
	| 'u256'
	| 'address'
	| 'signer'
	| '_'
	| {
			Datatype: {
				module: ModuleId;
				name: string;
				type_arguments: Type[];
			};
	  }
	| {
			vector: Type;
	  }
	| {
			Reference: [boolean, Type];
	  }
	| {
			TypeParameter: number;
	  }
	| {
			NamedTypeParameter: string;
	  }
	| {
			tuple: Type[];
	  }
	| {
			fun: [Type[], Type];
	  };

export interface ModuleId {
	address: string;
	name: string;
}

export type FunctionVisibility = 'Public' | 'Friend' | 'Package' | 'Private';
