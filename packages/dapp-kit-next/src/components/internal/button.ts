// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './button.styles.js';

export class Button extends LitElement {
	static override shadowRootOptions = {
		...LitElement.shadowRootOptions,
		delegatesFocus: true,
	};

	static override styles = styles;

	@property({ type: String })
	variant: 'primary' | 'secondary' = 'primary';

	@property({ type: Boolean, reflect: true })
	disabled = false;

	override render() {
		return html`
			<button type="button" ?disabled=${this.disabled} class=${classMap({ [this.variant]: true })}>
				<slot part="button-content"></slot>
			</button>
		`;
	}
}
