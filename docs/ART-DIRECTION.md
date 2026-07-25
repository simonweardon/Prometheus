# Prometheus — five paintings

Five slots, five prompts. Generate them, hand them back, and they drop straight
into the page.

**Save each file with the exact filename given.** The page already references
these paths, so a correctly-named file lights up its slot with no further work.

| # | File | Where it goes | Ratio |
| --- | --- | --- | --- |
| 1 | `hero.jpg` | Full-screen hero, behind the headline | 16:9 |
| 2 | `myth.jpg` | "Who We Are" portrait, beside *We stole the fire* | 3:4 |
| 3 | `break-bottleneck.jpg` | Mid-page break, *The bottleneck is never where you think it is* | 16:9 |
| 4 | `forge-process.jpg` | Behind the Week 1–8 engagement timeline | 16:9 |
| 5 | `cta-gift.jpg` | Closing call to action | 16:9 |

Drop them in `assets/art/`.

---

## The style stem — paste this in front of EVERY prompt

This is what keeps five separate generations looking like one painter's hand.
Don't paraphrase it between images; copy it verbatim each time.

```
Flemish Baroque oil painting on canvas, circa 1637, in the manner of Jan Cossiers
and Peter Paul Rubens. Heroic idealised anatomy, powerful dramatic chiaroscuro lit
by a single warm source, warm scumbled flesh tones, vermilion and lead-white
drapery caught mid-motion, deep amber and burnt-orange shadows, loose confident
brushwork with visible impasto in the highlights, aged darkened varnish, fine
craquelure, visible canvas weave. Shot flat as a museum reproduction — the painted
surface fills the entire frame edge to edge.
```

And this on the end of every prompt:

```
No text, no lettering, no signature, no watermark, no numbers, no picture frame,
no gallery wall, no border or matte. No modern objects. Not a 3D render, not
digital illustration, not anime, not a photograph of real people. No extra limbs,
no duplicated figures.
```

That second block matters more than it looks. Image models reflexively add a gold
frame, a gallery wall and a little brass plaque — all unusable when the painting
has to bleed to the edge of a browser window.

---

## 1 · `hero.jpg` — **16:9**

Your reference painting, mirrored so the headline has somewhere to live.

```
Wide 16:9 horizontal image.

Prometheus, a powerfully built bearded titan, plunging downward through open sky,
descending from the heavens. He grips a burning torch in his fist, its flame
streaming behind him. A vast vermilion-red cloak billows and twists around his
body, caught by the rushing air. He falls toward the lower right of the frame.

COMPOSITION IS CRITICAL: the figure occupies only the RIGHT THIRD of the image.
The entire LEFT TWO-THIRDS is empty, softly painted sky — dark storm cloud, a
shaft of warm light from above, atmospheric and low in detail, with nothing sharp
or attention-grabbing in it.
```

> The empty left side is where **"We bring the *fire* to your workflow"** sits. If
> the model centres the figure, the headline lands on his chest and neither reads.
> This is the one prompt worth re-rolling until the composition obeys.

The same file is reused on phones at a tighter crop, so keep the figure well
inside the frame rather than clipped at the edge.

## 2 · `myth.jpg` — **3:4 portrait**

The theft itself. Sits beside *We stole the fire from the gods.*

```
Tall 3:4 vertical portrait image.

Prometheus stealing fire from the gods. A muscular bearded titan in a deep red
cloak reaches up and touches the tip of a long hollow fennel stalk to the blazing
wheel of the sun-chariot of Helios, catching the first ember. Sparks scatter into
the darkness. His face is lit hard from above by the divine fire; everything else
falls away into deep warm shadow. Marble and cloud beneath his feet.

COMPOSITION: single figure, centred, three-quarter length. The blaze of divine
light is in the UPPER RIGHT. Deep shadow fills the lower left corner.
```

## 3 · `break-bottleneck.jpg` — **16:9**

Prometheus the *forethinker*, shaping the first humans out of clay — us building
your systems. Sits behind *The bottleneck is never where you think it is.*

```
Wide 16:9 horizontal image.

Prometheus shaping the first men out of river clay in a vast dim workshop. The
titan kneels in the LOWER THIRD of the frame, working a half-formed human figure
with his hands. Around him in the gloom stand several other unfinished clay
figures, barely emerging from the darkness. A single guttering torch on the wall
is the only light, throwing long shadows across a stone floor.

COMPOSITION IS CRITICAL: all figures and all detail sit in the LOWER THIRD. The
UPPER TWO-THIRDS is a dark empty vault — deep brown-black shadow, almost
featureless, no architecture, nothing bright. Overall a very dark painting.
```

> Headline and paragraph sit over the top two-thirds, so that area has to be
> near-black or the text won't survive it.

## 4 · `forge-process.jpg` — **16:9**

Behind the Week 1–8 timeline. Four blocks of text sit on this one, so it has to
be dark and *tonally even* — no bright patch anywhere near the middle.

```
Wide 16:9 horizontal image.

The forge of Hephaestus deep inside a mountain. Cyclopes work hammers at a great
anvil, sparks rising in the dark. The furnace mouth glows deep red FAR AWAY in the
distance at the centre of the frame.

COMPOSITION IS CRITICAL: an overall very dark, tonally even painting. The furnace
glow is small, distant and contained — it must not light up the foreground. No
bright highlights anywhere in the foreground or middle ground. Figures are
silhouettes and half-tones, kept low in the frame. Wide, deep, cavernous, murky.
```

## 5 · `cta-gift.jpg` — **16:9**

The payoff image. Warm where the other four are cold.

```
Wide 16:9 horizontal image.

Prometheus giving fire to mankind. The titan stands at the right, lowering a
burning torch toward a group of mortals gathered in darkness below him, who reach
up toward the flame with lit faces. Their world is black; the flame is the only
warmth in it. A faint band of dawn breaks along the horizon behind them.

COMPOSITION IS CRITICAL: all figures are in the LOWER THIRD. The UPPER TWO-THIRDS
is dark sky with only a soft warm glow rising from the torch below. Warm golden
and amber tones throughout, warmer than a typical dark baroque painting.
```

---

## Notes for generating

- **Ratios.** Grok and Gemini both default to square and will quietly ignore an
  aspect ratio buried in prose. Set it in the UI control if there is one — the
  prompts above also open with it as a belt-and-braces measure.
- **Generate 3–4 of each and send the best.** Composition is the instruction
  models disobey most; expect to bin the takes where the figure drifts to centre.
- **Squint at the negative space before sending.** If an area called out as
  "empty" has anything busy or bright in it, the text over it won't be readable.
  That is the single most common failure here.
- **Don't colour-correct them.** Send them as generated. The page darkens and
  seats them into the palette in CSS, and it does that better starting from an
  untouched file. Their natural warmth is now an asset — the site is soot and
  ember, so the paintings and the page want the same hue.
- **Size.** Biggest available. Compression to web sizes happens here.

## Handing them back

Any of these works:

1. **Google Drive** — drop them in a folder and say the name.
2. **Attach them in chat.**
3. **Commit them** to `assets/art/` on the `claude/prometheus-site-redesign-xl0pa0`
   branch, using the filenames above.
