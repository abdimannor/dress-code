# Dress Code

Lesson 4 of a small web course: **which CSS rule wins, and why.**

Live: [dress-code-bay.vercel.app](https://dress-code-bay.vercel.app/) · [Svenska](README.sv.md)

Lektion 1: [Hello Web](https://hello-web-kappa.vercel.app/) · Lektion 2: [Tech World](https://tech-world-zeta.vercel.app/) · Lektion 3: [Link Lab](https://link-lab-flax.vercel.app/) · Lektion 4: Dress Code (this one)

## Where it came from

The lesson started as a 2023 exercise: one tiny page (a greeting, a photo of a sea bird and the sentence "Idag ska vi lära oss om hur man skapar CSS på 3 olika sätt") styled three ways.

| File | Method | Where the rules are |
|---|---|---|
| `external.html` | External | In `style.css`, loaded with `<link>` in the head |
| `internal.html` | Internal | In a `<style>` block in the head |
| `inline.html` | Inline | In a `style` attribute on each element |

The three pages share exactly the same declarations and look identical. They and `style.css` are kept byte for byte as they are: they are the exhibit. The original 2023 versions are in the git history.

## What it teaches now

The exercise answers one question: where can CSS be written? The site follows it to the two questions that come right after.

1. **Which rule wins?** `cascade.html` walks through the whole cascade as [CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/#cascade-sort) defines it: origin and importance, context, element-attached styles (the `style` attribute), layers, specificity and order of appearance. The **cascade explainer** takes a small demo page, an element and a property, lists every declaration that applies (browser defaults, a simulated user style, layered and unlayered author rules, an inline style), sorts them step by step and says at which step each loser dropped out. Switch rules on and off, make them `!important`, and watch `!important` turn the layer order around and lift the user agent and user origins above the author. The author rules are applied for real in a frame, and the browser's computed value is checked against the sort.
2. **What does each way cost?** `cost.html` loads the three exhibit pages in hidden frames and shows what the browser itself measured with the Performance API: HTML and CSS bytes, what crossed the network and what came from the cache, whether `style.css` was render-blocking (`renderBlockingStatus`, Chromium only) and first paint. External CSS costs a render-blocking request but is cached on its own; internal and inline CSS ride inside every HTML page. The numbers depend on network, device and cache, so the page compares the three within one run and links [web.dev](https://web.dev/articles/critical-rendering-path/render-blocking-css) and MDN.

The front page keeps the original comparison plus two interactive parts:

- **Specificity arena.** One paragraph coloured by an external file, a `<style>` block and a `style` attribute. Toggle each source and `!important`; the frame is rebuilt so the browser resolves the cascade.
- **Predict the winner.** A quiz on top of the arena. Finishing it marks the lesson done.

The course bar, the next-lesson block and the motion switch come from `course.css` and `course.js`, identical in all four repos. Anything animated stays still when your system asks for reduced motion until you turn the switch on.

## Run it

Any static server works (the explainer and the measurements need http, not `file://`):

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Test it

```sh
npm ci
npx playwright install chromium
npm test
```

The Playwright suite checks that every page loads with no console errors, runs axe on each (the exhibit pages have no `h1` by design, so only that rule is off for them), tests the motion switch in a browser that asks for reduced motion, checks that the explainer and the browser agree in each scenario (including `!important` reversing layers and the user agent origin winning) and runs the measurement. CI also runs the HTML and link checker in `.github/workflows/check.yml`.

## License

MIT, see [LICENSE](LICENSE).
