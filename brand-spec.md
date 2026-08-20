# 3D Office Portfolio Brand Spec

## Experience Structure

- Outer experience: a quiet, explorable Three.js studio in neutral gray, walnut, concrete, and muted rose.
- Portfolio entrance: click the laptop or the `作品集` object navigation item.
- Inner experience: the existing product and interaction design portfolio, isolated as a same-origin static application under `/portfolio/`.

## Protected Interaction Contracts

- Preserve the room camera framing, orbit limits, object raycasting, mobile object navigation, day/night lighting, sketchbook, archive, and film interactions.
- Preserve the laptop focus transition before the portfolio opens.
- The outer close button, backdrop click, and `Escape` return the visitor to the room.
- An open project placeholder consumes its first `Escape`; a second `Escape` closes the portfolio and returns to the room.

## Portfolio Assets

- `/public/portfolio/`: deployable build of `../just-think-portfolio/`.
- `/public/portfolio/covers/project-01-cover.png` through `project-05-cover.png`: desensitized 1600 x 1000 project covers.
- `/public/portfolio/fonts/source-han-sans-sc-subset.ttf`: self-hosted Chinese typeface subset.
- `/public/portfolio/product-*.png` and `/public/portfolio/just-think-preview.png`: desensitized source interface imagery used inside the portfolio.

## Deployment

- Vite uses relative asset paths so the room remains deployable under the GitHub Pages project path.
- The GitHub Actions workflow builds this repository and publishes `dist/`.
