# Emu War — planning review and build notes

## What is locked from the supplied brief
- 58–63 seconds, 30 fps, vertical 1440×2560 final; 1080×1920 working composition.
- 41 planned setups, average 1.2–2.0 seconds, max shot 3 seconds without a new visual beat.
- 2D flat bean-head characters in a painted, ink-outlined 3D Wheatbelt world.
- Both captioned and clean exports; captions must be a separate overlay.
- Original story/characters/audio; no copied reference-channel material.
- First shot stays as planned: golden wheat field, gun and soldiers left, tiny emu silhouettes on horizon, one taller black lookout, low dolly-in.

## Repository audit findings
- The requested source repository is `mromidev/claude-animated-shorts`. The connected GitHub identity has read access to it but not push access.
- The writable working repository is `sleepywebdev/claude-animated-shorts`, which contains the same source tree. Work is isolated on branch `emu-war-production`; the original mromidev repository is untouched.
- The source is a template/skill repository, not a runnable Remotion app: it has no package manifest, root composition, entry point, public assets, voice file or word timings.
- The bridge scene loader requests optional Kenney GLBs from `public/bridge/kenney`; missing models are caught, but the bridge still needs its own render test.
- The still-render script hardcodes a Windows Chrome path; the merge script has a placeholder root path.
- Audio timeline values are duplicated by hand from story.ts, so changing scene timings can desynchronise sound.
- GitHub connector can read and commit text files but cannot install npm packages, execute TypeScript, launch a browser, or render Remotion frames. Therefore no compile/render/QA pass is claimed.

## Opening-scene implementation status
The first scene exists at `src/videos/emu/EmuWarOpening.tsx` and is registered as `EmuWarOpening` (126 frames / 4.2 seconds). It uses a procedural 3D field, simple Lewis-gun geometry, and CanvasTexture 2D character cards. It is an animatic prototype, not a final look-matched shot.

### Differences still to fix before calling it style-matched
1. Add the repository's world-ink pass, lens blur and grade chain to this composition. The current opening scene is not yet using the same post stack.
2. Replace the simple ground/horizon colours with painted HD CanvasTextures and the Wheatbelt palette.
3. Rework the composition so the soldiers and Lewis gun read clearly as a group on the left; avoid overlap.
4. Add proper tripod geometry, slouch hats/puttees, wheat foreground framing, ground shadows and a subtle low backlight.
5. Give the emu flock a coherent, frame-seeded motion; the current far silhouettes are a layout placeholder.
6. Recheck camera move and composition with actual rendered stills.

## Planning improvements to consider (not silently applied)
- **Factual qualification:** original line “The major reports almost a thousand emus, for almost ten thousand bullets. Exactly ten bullets per bird.” → consider “The major *claimed* 986 kills from 9,860 rounds — exactly ten rounds per bird, if you believe the report.” The report is disputed; the current wording could sound like an established count.
- **Evidence wording:** original line “Then they notice every flock has a lookout, a huge black bird, warning the others.” → consider “They begin noticing a lookout in some packs — a huge black bird that seems to warn the others.” The supplied ledger describes observers' impression about each pack, not a proven universal behaviour.
- **Cause-and-effect compression:** original line “After six days, the army goes home. Parliament jokes the emus deserve the medals. Five days later, it's back.” This compresses the withdrawal, farmer/WA Premier pushback, a later 300-kill report, approval on 12 Nov and return on 13 Nov. Keep the punchy line, but consider adding a short “farmers protest” beat if runtime permits.
- **Mechanism analogy:** “A machine gun is built for a crowd standing in a line” is a comic simplification. The stronger factual point is that the gun's fire could not reliably track many small, dispersing groups. Preserve the punchline while avoiding a claim that machine guns only work against lines.

No script changes have been committed; these are suggestions for approval.
