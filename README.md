# Dress Code

Live: [dress-code-bay.vercel.app](https://dress-code-bay.vercel.app/)

Lesson 4 of 4 in a small web course built from my first coursework pages from 2023. Each lesson keeps the original exercise, explains it, and adds something to try; a course bar at the top tracks which lessons you have finished (stored only in your browser) and links to the next one.

Lektion 1: [Hello Web](https://hello-web-kappa.vercel.app/) · Lektion 2: [Tech World](https://tech-world-zeta.vercel.app/) · Lektion 3: [Link Lab](https://link-lab-flax.vercel.app/) · Lektion 4: Dress Code (this one)

The same three elements, a paragraph, an image and a box of text, styled three times, once for each way of adding CSS to a page. It is an exercise from 2023 in where CSS can live and how the browser decides which rule wins. `index.html` is a small menu that links to the three versions.

| File | Method | Where the rules are |
|---|---|---|
| `external.html` | External | In `style.css`, loaded with `<link>` in the head |
| `internal.html` | Internal | In a `<style>` block in the head |
| `inline.html` | Inline | In a `style` attribute on each element |

## The reworked version

The lesson is unchanged: the three pages still use the three methods. The original is in the git history.

- **Identical by construction.** The three versions share exactly the same declarations (a centred card, a round photo, a light blue box), written once as a file, once as a `<style>` block and once as `style` attributes. Screenshots of the three pages are pixel-identical at desktop and mobile width.
- **Repetition shows.** `inline.html` now needs a long `style` attribute on every element, including `<body>` and `<main>`, which is the clearest argument for the other two methods.
- **The red leftover is gone.** `style.css` used to give `img` a red background that never showed (the JPEG has no transparent pixels and no padding) and that the other two versions lacked. It has been removed.
- **A comparison index.** `index.html` explains each method side by side: syntax, where it lives, its reach and how it ranks, plus a short note on which wins when they compete. Its `lang` is now `en`, matching its text.
- Each version links back to the comparison. The images have width and height set.

## On the page now

- **Specificity arena.** One paragraph coloured by an external file, a `<style>` block and a `style` attribute. Toggle each source and `!important` and the frame is rebuilt so the browser resolves the cascade, with a ranked explanation beside it.
- **Predict the winner.** A quiz on top of the arena: each round is a setup of sources and flags, you predict, then the arena is switched to that setup so the browser decides. Finishing it marks the lesson done.

The course bar, the next-lesson block and the motion switch come from `course.css` and `course.js`, which are identical in all four repos.

## Open it locally

No build step or server is needed. Clone the repository and open `index.html` in a browser:

```
git clone https://github.com/abdimannor/dress-code.git
cd dress-code
open index.html
```

On Windows or Linux, double-click the file or drag it into a browser window instead of `open`.

The site is hosted on Vercel; every push to `master` redeploys it.

## License

MIT, see [LICENSE](LICENSE).
