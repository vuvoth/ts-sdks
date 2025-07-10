// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import type { UiWallet } from '@wallet-standard/ui';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { WalletListItem } from './wallet-list-item.js';
import { styles } from './wallet-list.styles.js';

export class WalletList extends ScopedRegistryHost(LitElement) {
	static elementDefinitions = {
		'wallet-list-item': WalletListItem,
	};

	static override styles = styles;

	@property({ type: Object })
	wallets: UiWallet[] = [];

	override render() {
		return this.wallets.length === 0
			? html`<p class="no-wallets">No wallets available: TODO</p>`
			: html`<ul class="wallet-list">
					${this.wallets.map(
						(wallet, index) =>
							html`<wallet-list-item
								.wallet=${wallet}
								?autofocus=${index === 0}
							></wallet-list-item>`,
					)}
				</ul>`;
	}
}
