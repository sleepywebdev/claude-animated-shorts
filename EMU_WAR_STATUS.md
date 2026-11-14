# Emu War build status

- Writable work branch: `emu-war-production`
- Source style repository: `mromidev/claude-animated-shorts` (read-only permission through the connected GitHub account)
- Writable code repository: `sleepywebdev/claude-animated-shorts`
- P0: Remotion app skeleton and original bridge renderer copied into `src/videos/bridge`.
- P0: browser path in still-render helper made environment-driven.
- P0 prototype: opening setup 1 implemented in `src/videos/emu/EmuWarOpening.tsx`, registered as a 36-frame composition.
- No npm install, TypeScript check, still render, MP4 render or frame QA has run because the GitHub connector does not execute code.
- Next: install locally, run `npm run check`, render opening stills at frames 0/60/125, then adjust composition from actual images before coding setup 2.
