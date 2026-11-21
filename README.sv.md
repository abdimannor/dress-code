# Dress Code

Lektion 4 i en liten webbkurs: **vilken CSS-regel vinner, och varför.**

[English version](README.md) · Sajten: https://dress-code-bay.vercel.app/

## Bakgrund

Lektionen började som en övning 2023: en liten sida (en hälsning, ett foto av en sjöfågel och meningen "Idag ska vi lära oss om hur man skapar CSS på 3 olika sätt") stylad på tre sätt. `external.html` länkar `style.css`, `internal.html` har samma regler i ett `<style>`-block och `inline.html` skriver dem som `style`-attribut. De tre sidorna och `style.css` är oförändrade: de är själva utställningen.

## Vad lektionen lär ut nu

Övningen svarar på en fråga: var kan man skriva CSS? Sajten fortsätter till de två frågor som kommer direkt efter.

1. **Vilken regel vinner?** `cascade.html` går igenom hela kaskaden så som CSS Cascading and Inheritance Level 5 beskriver den: ursprung och vikt (`!important`), kontext, regler som sitter på elementet (`style`-attributet), lager, specificitet och ordning i dokumentet. Kaskadförklararen tar en liten demosida, ett element och en egenskap, listar varje deklaration som gäller (webbläsarens standardregler, en simulerad användarstil, author-regler i och utanför lager, en inline-stil), sorterar dem steg för steg och visar i vilket steg varje förlorare föll bort. Man kan slå på och av regler och göra dem `!important`, och se hur `!important` vänder på lagrens ordning. Author-reglerna används på riktigt i en ram, och webbläsarens beräknade värde jämförs med sorteringen.
2. **Vad kostar varje sätt?** `cost.html` laddar de tre sidorna i ramar och visar vad webbläsaren själv mätte med Performance API: byte för HTML och CSS, vad som hämtades över nätet och vad som kom från cachen, om `style.css` blockerade renderingen, och första målningen. Siffrorna beror på nät, enhet och cache, så sidan jämför de tre inom samma körning och länkar till web.dev och MDN för bakgrunden.

Startsidan har kvar den ursprungliga jämförelsen, specificitetsarenan och quizet där man gissar vinnaren.

Sidorna på sajten är på engelska, utom de tre utställningssidorna som är på svenska som i originalet.

## Kör den

Valfri statisk server fungerar:

```sh
python3 -m http.server 8000
```

Öppna sedan http://localhost:8000/.

## Testa den

```sh
npm ci
npx playwright install chromium
npm test
```

Playwright-sviten laddar varje sida utan konsolfel, kör axe på alla (de tre utställningssidorna saknar `h1` med avsikt, så bara den regeln är avstängd för dem), testar rörelsereglaget i en webbläsare som ber om reducerad rörelse, kontrollerar att förklararen och webbläsaren är överens i varje scenario (även när `!important` vänder lagren och när webbläsarens eget ursprung vinner) och kör mätningen. CI kör också HTML- och länkkontrollen i `.github/workflows/check.yml`.

## Licens

MIT, se [LICENSE](LICENSE).
