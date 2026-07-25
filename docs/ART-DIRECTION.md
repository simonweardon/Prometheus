# Prometheus — AI art direction & generation prompts

Everything the redesign needs, as a shopping list. Generate these in Grok /
Gemini, hand them back, and they drop straight into named slots in the page.

**Save each file with the exact filename given.** The redesign references those
paths directly, so correctly-named files light up their slots with no further
work.

---

## 0. The style stem — paste this in front of EVERY prompt

This is what keeps twelve separate generations looking like one painter's hand.
Do not paraphrase it between images; copy it verbatim each time.

```
Flemish Baroque oil painting on canvas, circa 1637, in the manner of Jan Cossiers
and Peter Paul Rubens. Heroic idealised anatomy, powerful dramatic chiaroscuro lit
by a single warm source, warm scumbled flesh tones set against a cool grey-blue
atmosphere, vermilion and lead-white drapery caught mid-motion, loose confident
brushwork with visible impasto in the highlights and soft glazed shadows, aged
darkened varnish, fine craquelure, visible canvas weave. Shot flat as a museum
reproduction — the painted surface fills the entire frame edge to edge.
```

And this on the end of every prompt:

```
No text, no lettering, no signature, no watermark, no numbers, no picture frame,
no gallery wall, no border or matte. No modern objects. Not a 3D render, not
digital illustration, not anime, not a photograph of real people. No extra limbs,
no duplicated figures.
```

Those two negatives matter more than they look. Image models love to add a gold
frame, a museum wall and a little brass plaque — all of which are unusable when
the painting has to bleed to the edge of the browser window.

---

## 1. Essential set — six images

The page works with just these six.

### A1 · `hero.jpg` — Hero background · **16:9**

The one from the reference: Prometheus plunging down out of Olympus with the
stolen fire. Composition is mirrored from the original so the headline has
somewhere to live.

```
Prometheus, a powerfully built bearded titan, plunging downward through open sky,
descending from the heavens. He grips a burning torch in his fist, its flame
streaming behind him. A vast vermilion-red cloak billows and twists around his
body, caught by the rushing air. His body is turned so he falls toward the lower
right of the frame.

COMPOSITION IS CRITICAL: the figure occupies only the RIGHT THIRD of the image.
The entire LEFT TWO-THIRDS is empty, softly painted sky — cool grey-blue clouds,
a shaft of pale light from above, atmospheric and low in detail, with nothing
sharp or attention-grabbing in it. Dark storm cloud along the top edge.
```

> Why: the whole left side is empty because "We bring the **fire** to your
> workflow" sits on top of it. If the model centres the figure, the headline
> lands on his chest and neither reads.

### A2 · `hero-mobile.jpg` — Hero background, phone · **3:4**

Same painting recomposed vertically — 16:9 art cropped to a phone screen loses
the figure entirely.

```
Prometheus, a powerfully built bearded titan, plunging downward through open sky
with a burning torch in his fist, vast vermilion-red cloak billowing around him.

COMPOSITION IS CRITICAL: tall vertical image. The figure sits in the LOWER
THIRD of the frame, falling toward the bottom edge. The entire UPPER TWO-THIRDS
is empty, softly painted storm sky — cool grey-blue cloud with a shaft of pale
light breaking through, atmospheric, low in detail, nothing sharp in it.
```

### A3 · `myth.jpg` — "Who We Are" portrait · **3:4**

The theft itself. Goes beside "We stole the fire from the gods."

```
Prometheus stealing fire from the gods. A muscular bearded titan in a deep red
cloak reaches up and touches the tip of a long hollow fennel stalk to the blazing
wheel of the sun-chariot of Helios, catching the first ember. Sparks scatter into
the darkness. His face is lit hard from above by the divine fire; the rest of the
scene falls away into deep warm shadow. Marble and cloud beneath his feet.

COMPOSITION: single figure, vertical, centred, three-quarter length. The blaze
of divine light is in the UPPER RIGHT. Deep shadow fills the lower left corner.
```

### A4 · `break-bottleneck.jpg` — Mid-page painting break · **16:9**

Sits behind "The bottleneck is never where you think it is." Prometheus the
*forethinker*, shaping the first humans out of clay — us building your systems.

```
Prometheus shaping the first men out of river clay in a vast dim workshop. The
titan kneels in the LOWER THIRD of the frame, working a half-formed human figure
with his hands. Around him in the gloom stand several other unfinished clay
figures, barely emerging from the darkness. A single guttering torch on the wall
is the only light, throwing long shadows across a stone floor.

COMPOSITION IS CRITICAL: all figures and all detail sit in the LOWER THIRD.
The UPPER TWO-THIRDS is a dark empty vault — deep brown-black shadow, almost
featureless, no architecture, no detail, nothing bright. Overall a very dark
painting.
```

> Why: the headline and paragraph sit over the top two-thirds. That area has to
> be near-black or the text won't survive it.

### A5 · `forge-process.jpg` — Process timeline background · **16:9**

Four columns of small text sit directly on this one, so it has to be dark and
*tonally even* — no bright patch anywhere near the middle.

```
The forge of Hephaestus deep inside a mountain. Cyclopes work hammers at a great
anvil, sparks rising in the dark. The furnace mouth glows deep red FAR AWAY in
the distance at the centre of the frame.

COMPOSITION IS CRITICAL: an overall very dark, tonally even painting. The
furnace glow is small, distant and contained — it must not light up the
foreground. No bright highlights anywhere in the foreground or middle ground.
Figures are silhouettes and half-tones, kept low in the frame. Wide, deep,
cavernous, murky.
```

### A6 · `cta-gift.jpg` — Closing call-to-action · **16:9**

The payoff image. Warm where every other one is cold.

```
Prometheus giving fire to mankind. The titan stands at the right, lowering a
burning torch toward a group of mortals gathered in darkness below him, who reach
up toward the flame with lit faces. Their world is black; the flame is the only
warmth in it. A faint band of dawn breaks along the horizon behind them.

COMPOSITION IS CRITICAL: all figures are in the LOWER THIRD of the frame. The
UPPER TWO-THIRDS is dark sky with only a soft warm glow rising from the torch
below. Warm golden and amber tones throughout, warmer than a typical dark
baroque painting.
```

### A7 · `canvas-texture.jpg` — Surface texture · **1:1, seamless/tileable**

Not a painting. This tiles over the whole site at ~6% opacity and is what makes
the flat colour between sections read as *canvas* rather than as a web page. Small
file, big effect.

```
A seamless tileable texture of bare aged linen artist's canvas. Visible woven
thread grain, a fine network of craquelure cracks in old varnish, subtle
mottling and age staining. Neutral warm grey-beige. Flat even lighting, no
shadows, no highlights, no vignette. Completely abstract — no image, no figures,
no objects painted on it. Tileable and seamless on all four edges.
```

---

## 2. Optional set — four more

Nice-to-have. Skip any of these and the layout falls back cleanly to the
existing engraved SVG icons.

### B1–B3 · `phase-1.jpg`, `phase-2.jpg`, `phase-3.jpg` — Method steps · **3:4 each**

One narrow panel per phase. Generate all three in one session so they match.

```
[B1 — Deep Diagnostic]
Prometheus the forethinker seated alone in shadow, leaning forward, watching
intently. One hand rests against his jaw. A single low lamp lights one side of
his face; the rest is deep shadow. Vertical composition, single figure,
three-quarter length, contemplative and still.
```

```
[B2 — Solution Architecture]
The goddess Athena in a plumed helmet standing over a workbench, guiding
Prometheus's hand as he shapes a clay figure. Both figures lean into the light of
a single lamp on the bench. Vertical composition, two figures, warm light from
below, deep shadow behind them.
```

```
[B3 — Build & Deploy]
A lit torch being passed from one hand to another, and beyond it a line of
figures receding into darkness, each lighting their own torch from the one
before. The flame multiplies away into the distance. Vertical composition, hands
and torch large in the foreground, figures small behind.
```

### B4 · `agents-automata.jpg` — AI Agents banner · **16:9**

The best mythological match on the whole page — Homer's golden handmaidens of
Hephaestus, automatons that worked the forge on their own.

```
The golden automatons of Hephaestus: metal handmaidens wrought of burnished
gold, moving and working at the forge on their own while the god sleeps in the
shadows at the edge of the frame. The gold figures catch the furnace light. They
are classical in form — smooth sculpted gold bodies, not machines, not robots,
no gears, no visible mechanism.

COMPOSITION: wide horizontal, figures across the LOWER HALF, upper half dark
and empty.
```

> The "not machines, no gears" line is doing real work — without it you get
> steampunk clockwork, which wrecks the period.

### B5 · `og-share.jpg` — Link preview card · **1.91:1 (1200×630)**

Just re-run the `hero.jpg` prompt at this ratio. This is the image that shows up
when the site gets pasted into Slack, iMessage or LinkedIn.

---

## 3. Practical notes for generating

- **Ratios.** Grok and Gemini both default to square and will quietly ignore an
  aspect ratio buried in the prose. Set it in the UI control if there is one, and
  also state it as the first words of the prompt: *"Wide 16:9 horizontal image."*
- **Generate 3–4 variants of each and send the best.** Composition instructions
  are the ones models disobey most often — expect to discard the takes where the
  figure drifts to centre.
- **Check the negative space before sending.** Squint at it: if the area called
  out as "empty" has anything busy or bright in it, the headline will not be
  readable over it. That is the single most common failure here.
- **Don't fix the colour or exposure.** Send them as generated. Tinting,
  darkening and colour-matching happen in CSS, and starting from an untouched
  file gives a better result.
- **Size.** Biggest available. Compression to web sizes happens here.
- **Format.** JPEG or PNG both fine. WebP conversion happens here.

## 4. Handing them back

Any of these works:

1. **Google Drive** — drop them in a folder and say the name; they can be pulled
   from Drive directly.
2. **Attach them in chat** — straightforward for a handful of files.
3. **Commit them** to `assets/art/` on the `claude/prometheus-site-redesign-xl0pa0`
   branch, using the filenames above.
