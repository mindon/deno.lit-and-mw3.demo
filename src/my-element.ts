// uncomment following to get `lit-localize extract` and `lit-localize build` command work
// import {str, msg, localized} from '@lit/localize';

// !bundle=/shared/depends
import {
  css,
  customElement,
  html,
  LitElement,
  property,
  ripplefx,
  xstyles,
} from "../deps.ts";

// !bundle=module
import { localized, msg, str } from "./locales.ts";

const xrules = xstyles(
  /([.]mdc-button(\.mdc-ripple-upgraded)?|:root)([._-]|\b)/,
  /^mdc-ripple/,
).map(({ cssText }) => cssText).join("\n");

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
      max-width: 800px;
    }
  `;

  @property()
  name = "World";

  @property({ type: Number })
  count = 0;

  firstUpdated() {
    ripplefx(".mdc-button", this.renderRoot);
  }

  render() {
    return html`
    <style>${xrules}</style>
      <h1>${this.sayHello(this.name)}! ${this.count}</h1>
      <button class="mdc-button">
        <div class="mdc-button__ripple"></div>
        <span class="mdc-button__label">Deno</span>
      </button>
      <button class="mdc-button">
        <div class="mdc-button__ripple"></div>
        <span class="mdc-button__label">Packup</span>
      </button>
      <button class="mdc-button" @click=${this._onClick} part="button">
        <div class="mdc-button__ripple"></div>
        <span class="mdc-button__label">${
      msg(str`Click Count: ${this.count}`)
    }</span>
      </button>
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
