# Aviv’s Maze Adventure

A tablet-friendly pen-tracing game with 20 difficulty stages with randomly generated mazes. Open `index.html` in a browser, or serve this directory:

```powershell
python -m http.server 8000 --bind 0.0.0.0
```

On a tablet connected to the same Wi-Fi, visit `http://YOUR-COMPUTER-IP:8000`. Your computer's firewall may need to allow the server. Use a browser tab for the game; an active stylus or a capacitive tablet pen works, and finger input is supported too.

A fresh maze is generated every time you open, restart, or retry a stage. Stage dimensions and path widths still follow the same difficulty progression.

Begin at the green Start circle and trace to the house. Lift the pen to rest and resume at the dark green dot. Wall contacts subtract 12 points, with a short cooldown so a single bump does not repeatedly deduct points. There is no time limit. Three stars require 900 points, two require 650, and completing a maze always earns one star. The Wider path button adds room without a score penalty.

Progress is saved locally in the current browser. Clearing browser storage clears progress. Fonts are optional downloads; the game itself has no external runtime dependencies.

Validation: JavaScript syntax checked; all 20 mazes checked for full connectivity and traversable solution paths. Physical tablet/stylus feel still needs testing with Aviv. This is a practice game, with no clinical claims or assessment.
