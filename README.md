# Pocket Arcade

40 games in one web app. Works on phones and at a keyboard, and can be added to a phone's home screen.

Play: https://officailspazzy.github.io/pocket-arcade/

## Editing

The game code lives in `src/`. `index.html` is generated, so edit the files in `src/` and run `./build.sh`.

- `src/head.html` - page markup and styles
- `src/core.js` - shared helpers (canvas, input, sound, scores)
- `src/g1.js` - arcade games
- `src/g2.js` - puzzle and board games
- `src/g3.js` - word, math, card and reflex games
- `src/boot.js` - the game launcher

After changing anything, bump the `CACHE` name in `sw.js` so installed copies pick up the update.
