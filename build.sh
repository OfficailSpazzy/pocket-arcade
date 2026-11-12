#!/bin/sh
# Joins the source pieces into the single index.html that GitHub Pages serves.
cd "$(dirname "$0")"
cat src/head.html src/core.js src/g1.js src/g2.js src/g3.js src/boot.js > index.html
echo "built index.html"
