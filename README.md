# Dress Code

The same three elements, a paragraph, an image and a box of text, styled three times, once for each way of adding CSS to a page. It is an exercise from 2023 in where CSS can live and how the browser decides which rule wins. `index.html` is a small menu that links to the three versions.

| File | Method | Where the rules are |
|---|---|---|
| `external.html` | External | In `style.css`, loaded with `<link>` in the head |
| `internal.html` | Internal | In a `<style>` block in the head |
| `inline.html` | Inline | In a `style` attribute on each element |

## What to look at

- **Same result, different reach.** The three pages look the same: bold blue text, a round image (`border-radius: 50%`) and a light blue box. The method does not change what CSS can do, only where it is written and how far it reaches. An external file can serve many pages, an internal block covers one page, and an inline style covers one element.
- **Repetition.** Compare `inline.html` with `internal.html`. Inline styles have to be written on every element, so styling a second paragraph means copying the attribute. The selectors in the other two versions (`p`, `img`, `div`) apply to every matching element at once.
- **Which rule wins.** If one page used all three methods for the same property, the inline style would win, because a `style` attribute outranks any selector in a stylesheet. Between an internal and an external rule with the same specificity, such as the plain element selectors used here, the one that appears later in the document wins. A `<style>` block placed after the `<link>` overrides the file, and one placed before it does not.
- **A leftover.** `style.css` also gives `img` a red background (line 7) that the other two versions lack. It never shows, because the JPEG has no transparent pixels and the image has no padding, but it means the three versions are not quite identical.

The example image now has alt text on all three pages.

## Open it locally

No build step or server is needed. Clone the repository and open `index.html` in a browser:

```
git clone https://github.com/abdimannor/dress-code.git
cd dress-code
open index.html
```

On Windows or Linux, double-click the file or drag it into a browser window instead of `open`.

There is no live demo. The repository is private and GitHub Pages is not enabled for it, so the Pages workflow has nothing to publish to.

## License

MIT, see [LICENSE](LICENSE).
