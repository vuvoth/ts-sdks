// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import * as v from 'valibot';

export const errorResponseSchema = v.object({
	error: v.object({
		status: v.string(),
		code: v.number(),
		message: v.string(),
		details: v.array(v.record(v.string(), v.any())),
	}),
});

export type ErrorResponse = v.InferInput<typeof errorResponseSchema>;
