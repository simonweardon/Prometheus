# Prometheus — five paintings

Five slots, five prompts, all pitched at the reference: **Jan Cossiers,
*Prometheus Carrying Fire*, c. 1637** — one of the Torre de la Parada
mythologies designed under Rubens, now in the Museo del Prado.

**Save each file with the exact filename given.** The page already references
these paths, so a correctly-named file lights up its slot with no further work.
Drop them in `assets/art/`.

| # | File | Where it goes | Ratio |
| --- | --- | --- | --- |
| 1 | `hero.jpg` | Full-screen hero, behind the headline | 16:9 |
| 2 | `myth.jpg` | "Who We Are" portrait, beside *We stole the fire* | 3:4 |
| 3 | `break-bottleneck.jpg` | Mid-page break, *The bottleneck is never where you think it is* | 16:9 |
| 4 | `forge-process.jpg` | Behind the Week 1–8 engagement timeline | 16:9 |
| 5 | `cta-gift.jpg` | Closing call to action | 16:9 |

---

## The style stem — paste this in front of EVERY prompt

Copy it verbatim each time; don't paraphrase it between images. This is what
keeps five separate generations looking like one painter's hand, and what pins
them to the reference rather than to generic "old master" mush.

```
Flemish Baroque oil painting on canvas, circa 1637, in the manner of Jan Cossiers
and Peter Paul Rubens — the Torre de la Parada mythological cycle now in the Museo
del Prado.

PALETTE AND LIGHT — this is the signature of the style and must be followed. A cool
grey-blue atmosphere fills most of the canvas, built from slate, pewter and soft
ultramarine, with dark umber storm cloud massed along one edge. Against that cool
ground sits a single burst of hot colour: drapery in vivid vermilion and coral red,
its deep folds glazed down to crimson and madder lake, its wind-caught crests struck
with lead white. Flesh is warm and sunlit against the cold air — ochre, sienna and
rose in the lights, translucent umber and olive-green in the shadows, ruddy at the
knuckles, knees, cheekbones and the soles of the feet. A shaft of pale gold light
breaks through the cloud and rakes across the figure, leaving one side brilliantly
lit and the other sunk in transparent shadow. The cold sky and the hot red are the
whole picture; everything else is tonal.

HANDLING: heroic idealised anatomy, heavy believable musculature, the torso twisting
against the direction of the legs so the pose spirals. Flesh painted smooth and
blended with soft sfumato edges; drapery, cloud and hair painted loose and wet-in-wet
with visible impasto standing up on the highlights. Aged darkened varnish, fine
craquelure across the surface, visible canvas weave. Photographed flat as a museum
reproduction — the painted surface fills the entire frame edge to edge.
```

And this on the end of every prompt:

```
No text, no lettering, no signature, no watermark, no inventory number or catalogue
number painted in the corner. No picture frame, no gallery wall, no border or matte.
No modern objects, no machinery, no clockwork, no gears. Not a 3D render, not digital
illustration, not concept art, not anime, not a photograph of real people.
Anatomically correct: one head, two arms, two legs, five fingers per hand. No
duplicated, merged or floating limbs.
```

> The negative block earns its length. Models reflexively add a gold frame, a
> gallery wall and a brass plaque — all unusable when the painting bleeds to the
> edge of a browser window. **"No inventory number"** is there because the
> reference itself has a painted *71* in its upper corner, and models imitating
> the style will happily reproduce that sort of mark.

---

## 1 · `hero.jpg` — **16:9**

The reference painting itself, recomposed so the headline has somewhere to live.

```
Wide 16:9 horizontal image.

Prometheus carrying the stolen fire down from Olympus. A powerfully built, mature
bearded titan caught mid-descent through open sky — his whole body airborne and
falling, no ground beneath him, nothing to brace against. His torso twists frontally
while his legs trail behind and above him, one knee driven forward, one bare foot
pointed down toward the earth he is falling toward. His head turns back and upward
over his shoulder toward the light he has just robbed: mouth set, brow heavy,
grey-brown hair and full beard streaming sideways in the rushing air.

In one fist, held low and close against his body, he grips a short thick torch of
green wood. Its flame gutters hard sideways, whipped flat by his own speed, throwing
sparks and a small pocket of gold light up across his forearm and thigh — the only
warm light source in the picture and the hottest point on the canvas. His other arm
is flung wide and open for balance, fingers spread against the sky.

A vast cloak of vivid vermilion red is wrapped at his hips and caught over one
shoulder, ballooning behind and above him in great wind-filled volumes. It is the
largest and hottest shape in the painting: crests catching lead-white light, hollows
glazed down into deep crimson, edges whipping into loose painterly tatters.

Above and behind him, dark umber storm cloud masses along the top edge, torn open by
a shaft of pale gold light that rakes down across his back and shoulders. The rest of
the sky is cool slate and grey-blue, thinning toward a pale band of distant sea at
the very bottom of the frame.

COMPOSITION IS CRITICAL: the figure occupies only the RIGHT THIRD of the image. The
entire LEFT TWO-THIRDS is empty sky — cool grey-blue cloud, atmospheric, softly
brushed, low in detail, with nothing sharp, bright or attention-grabbing anywhere in
it. Do not centre the figure. Keep the whole body comfortably inside the frame, not
clipped at the right edge.
```

> **This is the one to re-roll until it obeys.** The empty left side is where
> *"We bring the **fire** to your workflow"* sits. Centre the figure and the
> headline lands on his chest — neither survives. The same file is reused on
> phones at a tighter crop, which is why the body needs margin around it.

## 2 · `myth.jpg` — **3:4 portrait**

The theft itself. Sits beside *We stole the fire from the gods.*

```
Tall 3:4 vertical portrait image.

Prometheus stealing fire from the chariot of the sun. A muscular bearded titan in a
deep vermilion cloak stands braced on a shelf of cloud and marble, reaching up and
across his own body with both hands to touch the tip of a long hollow fennel stalk to
the blazing wheel-rim of the sun-chariot of Helios. The stalk has just caught: a
single ember glows at its tip and the first sparks scatter down into the darkness
below him.

The divine fire is the light source and it is savage — it blows out the upper right
of the canvas into pale gold and white heat, catches the rim of the wheel, and rakes
hard down the underside of his raised forearms, his shoulder, his cheekbone and the
bridge of his nose. Everything the light does not reach falls into transparent warm
shadow: his lower body, the folds of the cloak behind his legs, and the whole lower
left corner, which sinks to deep umber and near-black.

His expression is concentration, not triumph — jaw set, eyes narrowed against the
glare, one shoulder lifted defensively as though the heat might turn on him. The
cloak is caught by updraft and lifts behind him in heavy wind-filled folds, vermilion
crests struck with lead white, hollows glazed to crimson.

Behind and below, cool grey-blue cloud and thin atmosphere, painted loose, receding
into nothing. No landscape, no architecture, no other figures.

COMPOSITION: a single figure, vertical, centred, three-quarter length, filling the
height of the frame. The blaze of divine light is in the UPPER RIGHT. Deep shadow
fills the LOWER LEFT corner.
```

## 3 · `break-bottleneck.jpg` — **16:9**

Prometheus the *forethinker*, shaping the first humans out of river clay — us
building your systems. Sits behind *The bottleneck is never where you think it is.*

```
Wide 16:9 horizontal image.

Prometheus shaping the first men out of river clay in a vast dim workshop. The titan
kneels low in the frame, stripped to the waist with a length of dull vermilion cloth
bunched at his hips, both hands working the shoulder of a half-formed human figure
that lies across his knees — the clay still wet, still rough, one arm of it not yet
drawn out of the mass. His head is bent low over the work, face mostly lost in
shadow, back and shoulders catching the light.

Around him in the gloom stand several other unfinished clay figures at different
stages: one nearly complete and upright, one no more than a torso on a post, one
collapsed back into a heap. They are barely legible — suggested with a few strokes,
emerging from the darkness rather than described.

INTERIOR SCENE: the cool grey-blue of the style stem becomes cold thin daylight
falling from somewhere high and unseen; the hot vermilion is reduced to the cloth at
his hips and the ruddy warmth of his lit shoulder. A single guttering torch low on a
stone wall provides the only warm light, throwing long raking shadows across a rough
stone floor and up the far wall.

The mood is patient, unglamorous, physical: work being done in poor light. Wet clay
catches small dull highlights. Dust hangs in the torchlight.

COMPOSITION IS CRITICAL: all figures and all detail sit within the LOWER THIRD of
the frame. The UPPER TWO-THIRDS is a dark empty vault — deep brown-black shadow,
almost featureless, no architecture, no ceiling detail, nothing bright, no light
source visible. Overall a very dark painting.
```

> The headline and paragraph sit over the top two-thirds. That region has to be
> genuinely near-black, not merely dim, or the text won't survive it.

## 4 · `forge-process.jpg` — **16:9**

Behind the Week 1–8 timeline. Four blocks of small text sit directly on this
one, so it has to be dark and *tonally even* — no bright patch anywhere near the
middle.

```
Wide 16:9 horizontal image.

The forge of Hephaestus, deep inside a mountain. An enormous cavern of soot-blackened
rock. In the middle distance, heavy-shouldered cyclopes work in silhouette around a
great anvil — one with a hammer raised, one bent over the work, one hauling at a
bellows chain — their bodies rendered as dark half-tones with only the faintest ruddy
rim-light along a shoulder or forearm. Sparks rise in thin drifting constellations
into the dark above them.

Far away at the centre of the composition, the mouth of the furnace glows a deep,
contained red. It is small and distant. It does NOT light the room.

INTERIOR SCENE: the cool grey-blue of the style stem becomes cold grey-black cavern
gloom; the hot vermilion is reduced to that single distant furnace mouth and a few
scattered sparks. Smoke and forge-haze hang in thick layers, flattening the depth and
softening every edge.

Tools, chains, half-finished bronze and stacked billets litter the foreground, all of
it in deep shadow, described by silhouette alone rather than by highlight.

COMPOSITION IS CRITICAL: an overall very dark, tonally EVEN painting — no bright
passages anywhere in the foreground or middle ground, and no hot spot near the centre
or left of the frame. The furnace glow stays small, distant and contained. Figures
are kept low in the frame and read as silhouettes. Wide, deep, cavernous, murky,
smoke-filled.
```

## 5 · `cta-gift.jpg` — **16:9**

The payoff image, and the warm one — every other painting here is cold.

```
Wide 16:9 horizontal image.

Prometheus giving fire to mankind. The titan stands at the right of the frame, one
foot braced on a low rock, leaning down and out over a group of mortals gathered in
the darkness below him. He lowers a burning torch toward them at arm's length. His
vermilion cloak falls from his shoulder in heavy vertical folds, lit along its leading
edge by the torch he holds.

Below him, eight or ten mortals — men, women, an old man on his knees, a woman
holding a child — press upward toward the flame with their arms raised and their
hands open. Their faces are the emotional centre of the painting: lit hard from above
by the torch, upturned, caught between hunger and disbelief. Some shield their eyes.
One reaches with a bundle of dry sticks, already trying to take the fire for himself.

Their world is black. The flame is the only warmth in it, and it falls on them like
a shaft — hot gold on the upturned faces and raised forearms, dying to deep umber
within a few feet. Behind and beyond them, a faint cold band of dawn breaks along a
low horizon, the first light of the world they are about to change.

Unlike the other paintings in this set, warm golden and amber tones dominate
throughout — this one is lit from within, and it should feel like relief after cold.

COMPOSITION IS CRITICAL: all figures — the titan included — sit within the LOWER
THIRD of the frame. The UPPER TWO-THIRDS is dark open sky carrying only a soft warm
glow rising from the torchlight below, with no stars, no moon, no cloud detail and
nothing sharp in it.
```

---

## Notes for generating

- **Ratios.** Grok and Gemini both default to square and will quietly ignore an
  aspect ratio buried in prose. Set it in the UI control if there is one — the
  prompts also open with it as a belt-and-braces measure.
- **Long prompts drift.** The composition block is last in every prompt for a
  reason: it's the instruction most likely to get lost, and last position gives
  it the best odds. If a model keeps ignoring it, re-send just the style stem
  plus the COMPOSITION paragraph, and drop the middle description entirely.
- **Generate 3–4 of each and send the best.** Composition is what models disobey
  most; expect to bin the takes where the figure drifts to centre.
- **Squint at the negative space before sending.** If an area called out as
  "empty" has anything busy or bright in it, text over it won't be readable.
  That is the single most common failure here.
- **Don't colour-correct them.** Send them as generated. The page darkens and
  seats them into the palette in CSS, and does that better from an untouched
  file. Their natural warmth is an asset now — the site is soot and ember, so
  the paintings and the page want the same hue.
- **Size.** Biggest available. Compression to web sizes happens here.

## Handing them back

Any of these works:

1. **Google Drive** — drop them in a folder and say the name.
2. **Attach them in chat.**
3. **Commit them** to `assets/art/` on the `claude/prometheus-site-redesign-xl0pa0`
   branch, using the filenames above.
