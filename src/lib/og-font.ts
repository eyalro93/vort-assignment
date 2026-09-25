// next/og (satori) ships no default font with Hebrew glyphs, so without this
// the OG image would render Hebrew as blank boxes. This fetches a subset
// TTF from Google Fonts covering the Hebrew alphabet + digits we need.
// Standard recipe: request with an old-browser UA so Google serves TTF
// instead of WOFF2, which satori can't parse.
const CHAR_SET =
  "אבגדהוזחטיכלמנסעפצקרשתךםןףץ0123456789%.,־–—׳״ Vort";

export async function loadHeeboFont(weight: 400 | 600 | 800): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Heebo:wght@${weight}&text=${encodeURIComponent(CHAR_SET)}`;
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
    },
  }).then((res) => res.text());

  // Google now serves this old-Chrome UA a plain WOFF (satori supports woff/ttf/otf,
  // just not woff2) -- match the url regardless of the declared format.
  const match = css.match(/src: url\(([^)]+)\)/);
  if (!match) {
    throw new Error("Could not find Heebo font URL in Google Fonts CSS");
  }

  const fontResponse = await fetch(match[1]);
  return fontResponse.arrayBuffer();
}
