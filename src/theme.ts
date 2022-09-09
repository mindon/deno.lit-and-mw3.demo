import {
  applyTheme,
  argbFromHex,
  Hct,
  sourceColorFromImage,
  themeFromSourceColor,
} from "npm>:@material/material-color-utilities/typescript/index.ts";

// Simple demonstration of HCT.
const color = Hct.fromInt(0xff4285f4);
console.log(`Hue: ${color.hue}`);
console.log(`Chrome: ${color.chroma}`);
console.log(`Tone: ${color.tone}`);

// Get the theme from a hex color
export async function themeFromImage(img: any, area?: string) {
  if (img && area) {
    img.dataset.area = area;
  }
  console.log(img.width, img.height);
  const origin = img ? await sourceColorFromImage(img) : argbFromHex("#f82506");

  const theme = themeFromSourceColor(origin, [
    {
      name: "custom-1",
      value: argbFromHex("#ff0000"),
      blend: true,
    },
  ]);

  // Print out the theme as JSON
  // console.log(JSON.stringify(theme, null, 2));

  // Check if the user has dark mode turned on
  const { matchMedia } = globalThis;
  const systemDark = matchMedia("(prefers-color-scheme: dark)").matches;

  // // Apply the theme to the body by updating custom properties for material tokens
  applyTheme(theme, { target: document.documentElement, dark: systemDark });
}

themeFromImage(document.querySelector("img"));

(globalThis as any).themeFromImage = themeFromImage;
