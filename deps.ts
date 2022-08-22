import "https://cdn.skypack.dev/trusted-types?dts";

export type { TemplateResult } from "https://cdn.skypack.dev/lit?dts";

// @deno-types="https://cdn.skypack.dev/lit?dts"
export { css, unsafeCSS, html, LitElement } from "https://cdn.skypack.dev/lit";
export {
  customElement,
  property,
  state,
} from "https://cdn.skypack.dev/lit/decorators";

export {
  xstyles,
  ripplefx,
} from "./src/xstyles.ts";
