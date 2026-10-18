# Aviv’s Maze Adventure

A tablet-friendly pen-tracing game with 20 difficulty stages with randomly generated mazes. Open `index.html` in a browser, or serve this directory:

```powershell
python -m http.server 8000 --bind 0.0.0.0
```

On a tablet connected to the same Wi-Fi, visit `http://YOUR-COMPUTER-IP:8000`. Your computer's firewall may need to allow the server. Use a browser tab for the game; an active stylus or a capacitive tablet pen works, and finger input is supported too.

A fresh maze is generated every time you open, restart, or retry a stage. Stage dimensions and path widths still follow the same difficulty progression.

Begin at the green Start circle and trace to the house. Lift the pen to rest and resume at the dark green dot. Wall contacts subtract 12 points and restart the attempt on the same maze: the animal returns to Start, the trail and collected acorns clear, and the timer returns to zero. Lift the pen and place it at Start to resume. The timer counts seconds from opening the stage, continues during pen rests, and stops on completion. There is no time limit. Three stars require 900 points, two require 650, and completing a maze always earns one star. The Wider path button adds room without a score penalty.

Progress is saved locally in the current browser. Clearing browser storage clears progress. Fonts are optional downloads; the game itself has no external runtime dependencies.

Validation: JavaScript syntax checked; all 20 mazes checked for full connectivity and traversable solution paths. Physical tablet/stylus feel still needs testing with Aviv. This is a practice game, with no clinical claims or assessment.


## Animal adventures

Choose one of eight animal friends to guide home. Rescues add that friend to your woodland, and repeated finishes add decorations. Three optional acorns appear along the maze, including side paths when available. Collected acorns are added to your total when you finish. The Journey progress bar tracks the farthest room reached along the solution route. Side paths and retracing do not inflate it. It reaches 100% only on completion and resets after a wall hit.

Choose gentle turns or wiggly trails. Cozy mode always provides a small, wide maze and does not unlock journey stages. After repeated wall bumps the game offers cozy mode; a high-scoring finish offers an optional narrower trail. Wider path is always available.

The daily adventure contains three fresh rescue mazes, with five bonus acorns after the third. It resets on the device’s local date, with no streak penalties. Progress, collection, and sound preference stay on the device. Wall-hit boops are enabled by default and can be muted; browser audio starts after a user interaction.

## Android installation

Open https://orenbusk.github.io/aviv-maze-adventure/ in Chrome. Choose **Install app** or **Add to Home screen → Install** from Chrome’s menu. The web app manifest includes custom fox icons at 192 and 512 pixels, and the app opens in its own window. Remove the old Chrome shortcut and install again if it retains the previous icon. A plain browser shortcut may still show a Chrome badge, depending on the Android launcher.

After one online visit the service worker caches the game for offline use. It checks the network first on later visits to receive updates.

Maze routes cover at least 65% of a larger grid (starting at 6 × 4 rooms). The home is placed at the farthest dead end from Start, with exactly one connecting corridor.

## Letter tracing
Use the game section buttons to switch between maze adventures and Learn letters.
The letter section teaches 26 capital English letters (A–Z), with numbered strokes,
a direction arrow, and a Show me demonstration of the current stroke. Follow each
stroke in order; lifting the pen keeps progress, while leaving the guide asks the
child to resume at the green dot. Each successful trace shows a random happy announcement. Complete a letter five times
to unlock the next. Saved counters on the board and letter menu show completions out of five.
Previously completed letters count as one trace each. Letter progress is saved separately on this device.
Celebrations respect the shared Sound control. Both sections are cached for offline use.

Run letter checks with node verify-letters.cjs, and maze checks with node verify.cjs.
