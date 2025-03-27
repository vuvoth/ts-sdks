// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

export class MemoCache {
	#methods = new Set<string>();
	#cache: Map<string, unknown> = new Map();

	create<R>(key: string, fn: () => Promise<R>) {
		if (this.#methods.has(key)) {
			throw new Error(`Method ${key} already exists`);
		}

		this.#methods.add(key);

		return (): R | Promise<R> => {
			if (this.#cache.has(key)) {
				return this.#cache.get(key) as Promise<R>;
			}

			const promise = fn();
			this.#cache.set(key, promise);

			promise
				.then((val) => this.#cache.set(key, val))
				.catch(() => {
					this.#cache.delete(key);
				});

			return promise;
		};
	}

	reset() {
		this.#cache.clear();
	}
}
