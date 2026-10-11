# OpusClip rebrand: Visible judgment

My submission for the OpusClip Senior Visual Designer challenge: a rebrand thesis and a working proof of concept of the homepage.

- [`rebrand-thesis.pdf`](rebrand-thesis.pdf): the direction, why it fits OpusClip now, and how it compares with the current brand.
- [`proof-of-concept-page.pdf`](proof-of-concept-page.pdf): high-fidelity desktop frames and annotated specs for the key interactions.
- [`website/`](website/): the homepage itself, built so you can scroll it, hover it and click through it.

## The problem

OpusClip has outgrown its brand. The product has moved from a clipping tool to an AI video agent (ClipAnything, ReframeAnything, AI Producer, Agent Opus), and more of its growth now comes from teams and businesses. The website still looks like most AI tools: a centred headline, a link input and a product demo card, set in Geist, with "#1", "viral" and "10x" doing most of the talking.

That positioning is easy to copy. Klap, Vizard and Submagic make the same promises, and they go after OpusClip's virality score directly, calling it decorative. The brand needed something competitors can't say back to it.

## What I came up with

**Visible judgment.** OpusClip's strength is that it makes a decision about your video. So the brand shows that decision happening.

- **The footage is the brand.** The homepage opens on a wall of real vertical clips drifting in alternating columns, all in greyscale. Every few seconds the agent picks one: crop marks draw around it, its colour comes back, it plays, and a short reason appears beside it. That one moment is the signature of the whole system.
- **One colour, one meaning.** The palette is true black, a warm paper tone and the footage. A single cobalt accent is used only for "picked", everywhere it appears.
- **Type with a point of view.** Familjen Grotesk for headlines and Schibsted Grotesk for text, instead of the default developer-tool sans.
- **A page that scrolls like the feed it publishes to.** OpusClip's users live in YouTube Shorts, Instagram Reels and TikTok, so the homepage borrows that grammar: one full-screen section per swipe, up and down controls with a progress track, a round action column, word-by-word captions, and only the clip on screen playing.
- **Proof next to every claim.** I kept OpusClip's real claims ("#1 AI video clipping tool", "1 long video, 10 viral clips", "Used by 20M+ creators and businesses") and put the evidence beside them: the creator roster, every published testimonial with its analytics screenshot, the score broken into Hook, Flow, Value and Trend grades, and the SOC 2 and G2 recognition.

### The page, top to bottom

1. **Hero:** the reel wall with the agent picking clips, the headline, and a link input to get started.
2. **Product:** three phones on one screen for scoring, editing tools and team templates. Hovering or selecting one dims the others and opens its description and controls, which drive a live demo inside that phone.
3. **Creators:** rows of creator profiles scrolling in alternating directions.
4. **Customer stories:** quotes from Lewis Howes, Jason Lemkin, Jacksfilms and WildBrain, plus result cards that open each creator's analytics.
5. **FAQ:** the common questions, with a direct line to Discord and email.
6. **Closing call to action** and the **footer**. Keep scrolling past the footer and the full-width wordmark appears with footage playing through the letters, then springs back when you let go.

## Built to be shipped

I designed this so the team could build it with the tools the role uses:

- **Figma** for the frames.
- **Webflow** for layout, scroll snapping, the drifting columns and the hover interactions.
- **Rive** for the clip pick: one state machine (idle, selecting, selected, released) that can be dropped onto any clip.

The prototype here is plain HTML, CSS and JavaScript with no framework or build step, and every interaction is specified in the proof-of-concept PDF with timings and easing.

I used AI tools along the way, mainly to speed up research, prototyping and checking details like text alignment across screen densities.

## Running the website

Open `website/index.html` in a recent version of Chrome, Edge or Safari. The page is designed for desktop.

To serve it locally instead:

```
cd website
python -m http.server 8000
```

Then visit http://localhost:8000.

## Notes and credits

- This is a design concept, not the official OpusClip website.
- The footage is from Pexels and stands in for licensed creator clips.
- The OpusClip logo, creator avatars, testimonials and analytics screenshots are from opus.pro.
- Social icons are from Font Awesome Free, licensed CC BY 4.0.
- Typefaces are Familjen Grotesk and Schibsted Grotesk from Google Fonts, under the SIL Open Font License.
