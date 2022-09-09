A deno lit demo with localization
=======

how to localize with lit-localize?
------------
nodejs from https://nodejs.org is required.

`npm i` to use lit-localize tool to extract i18n msg and build l10n msg

add localize imports
`grep -l 'locales.ts' src/**/*.ts -exec sed -i '' 's$locales.ts[\'"];$\0import {msg,src,localized} from "@lit/localize";' {} \;`

`lit-localize extract` to extract i18n messages into **xliff/**.
after updating **xliff/*.xlf**, run `lit-localize build` to generate l10n messages in **src/locales/**.


**post process**

remove localize imports
`grep -l 'locales.ts' src/**/*.ts -exec sed -i '' 's$import {msg,src,localized} from "@lit/localize";$$' {} \;`

update localize imports in **src/locales/*.ts**
`sed -i '' "s$'@lit/localize'$'https://cdn.skypack.dev/@lit/localize\?dts'$" src/locales/*.ts`


**src/locales.ts** loads relative locale ts, and providing **window.setLocale(id)**,  **window.getLocale()** and  **window.locales**.


how to serve or build with packup?
------------
deno from https://deno.land/ is required.

**packup** from https://github.com/mindon/packup is required to pack dist/

import from **npm~** is supported with this repo of packup

`packup build src/*.html` to build production dist/

`packup src/*.html` to serve for development on http://localhost:1234

