// uncomment following to get `lit-localize extract` and `lit-localize build` command work
// import {str, msg, localized} from '@lit/localize';

// !bundle=/shared/depends
import { css, customElement, html, LitElement, property } from "../deps.ts";

// !bundle=module
import { localized, msg, str } from "./locales.ts";

// !bundle=off
import "https://cdn.skypack.dev/@material/web/button/filled-button.js";

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("my-element")
@localized()
export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      margin: 1rem;
      max-width: 800px;
    }
  `;

  @property()
  name = "World";

  @property({ type: Number })
  count = 0;

  render() {
    return html`
      <h1>${this.sayHello(this.name)}! ${this.count}</h1>
      <md-filled-button label="Deno"></md-filled-button>
      <md-filled-button label="Packup"></md-filled-button>
      <md-filled-button label="${
      msg(str`Click Count: ${this.count}`)
    }" @click=${this._onClick}></md-filled-button>
      <slot></slot>
    `;
  }

  private _onClick() {
    this.count++;
    this.dispatchEvent(new CustomEvent("count-changed"));
  }

  /**
   * Formats a greeting
   * @param name The name to say "Hello" to
   */
  sayHello(name: string): string {
    return `Hello, ${name}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
