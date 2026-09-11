# Kaminari sounds

Every sound the site plays lives in this folder. The files here are placeholders. To use your own sound,
give your file the **same name** as the one it replaces.

- Same format: overwrite the file (e.g. replace `dash.wav` with your own `dash.wav`).
- Different format: delete the placeholder and add yours with the same name, e.g. delete `dash.wav`, add `dash.mp3`.
  The site looks for each name as `.wav`, then `.mp3`, `.ogg`, `.m4a`, and uses the first one it finds.

Keep effects short and trimmed (no silence at the start), so they land exactly on the action.

| File | When it plays |
| --- | --- |
| `thunder.wav` | Thunder crack: entering the site, lightning bolts, the sky bolts, Raikō's big moments |
| `intro-ambience.wav` | **Opening:** storm bed (wind, drone, distant thunder) from the moment you click "Enter with sound"; fades out when your name appears |
| `intro-chant.wav` | **Opening:** Raikō chants his technique during the angry charge-up. The charge lasts as long as the line, and the slash lands as it ends. The last ~1s of the file is treated as echo that rings over the slash |
| `dash.wav` | Raikō dashes / slashes to a new spot (opening slashes, moving between sections) |
| `land.wav` | He lands after a dash |
| `flurry-cut.wav` | Opening: each of the ~20 super-fast cuts across the screen (plays many times quickly, keep it very short) |
| `rage-charge.wav` | Opening: the angry charge-up aura before the finisher |
| `finisher.wav` | Opening: the giant finishing slash |
| `curtain-break.wav` | Opening: the cut-up screen shatters and falls away |
| `name-reveal.wav` | Your name is cut into the hero with lightning |
| `wake.wav` | He wakes up from sleeping |
| `sleep.wav` | He dozes off after you stop moving for a while |
| `shy.wav` | You hover the cursor on him (he gets shy) |
| `wave-hi.wav` | You keep hovering: he waves "Hi!" |
| `grab.wav` | You pick him up by dragging |
| `drop-thud.wav` | You let go and he hits the floor (louder from higher up) |
| `bow.wav` | He bows (contact links) |

## Music

`theme` (any of `.mp3`, `.m4a`, `.ogg`, `.wav`): background music, looped. With the opening, it comes in when your name is revealed.
Looked up in the same order as the effects (`.wav` first). Until one exists a synthesized drum loop plays.

`intro-chant.yours.wav` is your earlier 17s recording, kept for reference; the site doesn't load it.
