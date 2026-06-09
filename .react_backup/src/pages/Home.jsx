import { useEffect } from 'react'

export default function Home({ onNavigate }) {
  useEffect(() => {
    // Note: The original antigravity.js and ascii-text.js were wiped by the Vite scaffold.
    // They should be restored and called here.
    if (window.AntigravityApp) window.AntigravityApp.init()
    if (window.createASCIIText) window.createASCIIText()
  }, [])

  return (
    <>
      <div id="antigravity-mount" aria-hidden="true" />
      
      <main className="hero">
        <canvas id="logo-canvas" />

        <h1 className="hero-name" id="hero-name" style={{ opacity: 0, transform: 'translateY(30px)' }}>
          <span className="sr-only">AABID</span>
          <div id="ascii-text-mount" className="ascii-text-mount" aria-hidden="true" />
        </h1>

        <p className="hero-sub" id="hero-sub" style={{ opacity: 0 }}>PORTFOLIO</p>

        <div className="hero-cta" id="hero-cta" style={{ opacity: 0, transform: 'translateY(20px)' }}>
          <a href="/projects" onClick={e => { e.preventDefault(); onNavigate('/projects') }} className="btn-primary"><span>View Projects ↗</span></a>
          <a href="/contact" onClick={e => { e.preventDefault(); onNavigate('/contact') }} className="btn-ghost"><span>Get In Touch</span></a>
        </div>
      </main>

      <nav className="page-tiles" id="page-tiles" style={{ opacity: 0 }} aria-label="Pages">
        <a href="/projects" onClick={e => { e.preventDefault(); onNavigate('/projects') }} className="page-tile" style={{ '--t-color': '#00ff41' }}>PROJECTS</a>
        <a href="/journey" onClick={e => { e.preventDefault(); onNavigate('/journey') }} className="page-tile" style={{ '--t-color': '#ff006e' }}>JOURNEY</a>
        <a href="/universe" onClick={e => { e.preventDefault(); onNavigate('/universe') }} className="page-tile" style={{ '--t-color': '#f4a261' }}>UNIVERSE</a>
        <a href="/contact" onClick={e => { e.preventDefault(); onNavigate('/contact') }} className="page-tile" style={{ '--t-color': '#4cc9f0' }}>CONNECT</a>
      </nav>

      <div style={{ position: 'fixed', right: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.8rem', pointerEvents: 'none' }}>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '.6rem', letterSpacing: '3px', color: 'rgba(59,147,246,0.5)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>01 / 05</span>
        <div style={{ width: '1px', height: '3rem', background: 'rgba(59,147,246,0.2)' }} />
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '.6rem', letterSpacing: '2px', color: 'rgba(59,147,246,0.3)', writingMode: 'vertical-rl' }}>HOME</span>
      </div>
    </>
  )
}
