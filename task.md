# Porto → Vite + React Migration

## Phase 1 — Scaffold & Dependencies
- [/] Scaffold Vite + React in `/porto`
- [ ] Install: react-router-dom, three, @react-three/fiber, @react-three/drei, maath
- [ ] Download lens.glb, bar.glb, cube.glb → public/assets/3d/

## Phase 2 — Core Shell
- [ ] src/index.css (port style.css, revert universe hacks)
- [ ] src/main.jsx (entry + BrowserRouter)
- [ ] src/App.jsx (routes + shared layout shell)
- [ ] src/hooks/useCursor.js
- [ ] src/hooks/usePageTransition.js
- [ ] src/components/NavMenu.jsx
- [ ] src/lib/ (antigravity, ascii-text, hyperspeed as raw JS)

## Phase 3 — Pages
- [ ] src/pages/Home.jsx
- [ ] src/pages/Projects.jsx
- [ ] src/pages/Journey.jsx
- [ ] src/pages/Universe.jsx (+ FluidGlass)
- [ ] src/pages/Contact.jsx
- [ ] src/components/FluidGlass.jsx

## Phase 4 — Polish & Verify
- [ ] npm run dev — check all routes
- [ ] Fix any console errors
- [ ] Verify FluidGlass renders on /universe
