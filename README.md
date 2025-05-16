# Tetris Game

A classic Tetris implementation using HTML5 Canvas, CSS, and JavaScript.

## How to Play

1. Open the `index.html` file in your web browser.
2. Click the "Start/Restart" button to begin playing.
3. Use the arrow keys to control the falling pieces:
   - ← / → Arrow keys: Move the piece left/right
   - ↓ Arrow key: Soft drop (move down faster)
   - ↑ Arrow key: Rotate the piece
   - Space bar: Hard drop (instantly drop the piece)
   - P key: Pause/resume the game

## Game Rules

- Complete horizontal lines to clear them and earn points.
- The game speeds up as you level up.
- The game ends when the pieces stack up to the top of the board.

## Scoring

- 1 point for each soft drop (down arrow)
- 2 points for each cell in a hard drop (space bar)
- Line clear points (multiplied by your current level):
  - 1 line: 40 points
  - 2 lines: 100 points
  - 3 lines: 300 points
  - 4 lines: 1200 points

## Level System

- You advance to the next level for every 10 lines cleared.
- Each level increases the falling speed of the pieces.

## Technical Implementation

This game is built with:
- HTML5 Canvas for rendering
- JavaScript for game logic
- CSS for styling

The codebase includes:
- Tetromino generation and movement
- Collision detection
- Wall kick implementation for rotation
- Scoring and level system
- Next piece preview

Enjoy playing! 