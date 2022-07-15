# Tetris

Classical Tetris game implemented using the following technologies:

- TypeScript
- React 18.0.15
- Tailwind CSS
- Vite
- Node.js version 18.4.0, npm version 8.12.1
- HTML Canvas element

Template for the project was created usin create-vite:

    npm create vite@latest tetris --template react-ts

Tailwind CSS was added using instructions from [Vite Guide](https://tailwindcss.com/docs/guides/vite).

Formatting of code by Prettier.

## Building

    npm i
    npm run build
    npm run dev

## How to Play
| Key | Action |
| ----------- | ----------- |
| Arrow left / right | Move piece left / right |
| Arrow down | Drop the piece quicker |
| Arrow up | Rotate piece |
| Space | Toggle pause |

You can play it [here](https://cool-html5.net/tetris/).

## Piece Randomization

Math.random with Math.round is used but first and last values are discarded because it seems to underrepresent those values.
