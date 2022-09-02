export { localized, msg, str } from "https://cdn.skypack.dev/@lit/localize";

import { configureLocalization } from "https://cdn.skypack.dev/@lit/localize";

// @customElement('my-element')
// @localized() should after @customElement, this order MATTERS!

// prepare
// npm i @lit/localize
// npm i -D @lit/localize-tools
//
// step 1. `lit-localize extract` extract msgs (TODO: how to keep xlf translation targets)
// step 2. update xliff/*.xlf
// step 3. `lit-localize build` generate src/locales/*.ts
// step 4. `sed -i '' "s$'@lit/localize'$'https://cdn.skypack.dev/@lit/localize'$" src/locales/*.ts`
// step 5. `packup build`
import * as zh_CN from "./locales/zh_CN.ts";

const sourceLocale = "en";
const targetLocales = ["zh_CN"];
const allLocales = [sourceLocale].concat(targetLocales);

const locales = new Map(
  targetLocales.map((locale) => [locale, { templates: zh_CN.templates }]),
);

const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale: string) => locales.get(locale),
});

const win = globalThis as any;
win.setLocale = setLocale;
win.getLocale = getLocale;
win.locales = allLocales;
// win.addEventListener('lit-localize-status', (event) => {
//   const { detail } = event;
//   console.log(detail);
// });
