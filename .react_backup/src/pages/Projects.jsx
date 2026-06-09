import { useEffect, useRef } from 'react'
import Hyperspeed from '../components/Hyperspeed'

export default function Projects({ onNavigate }) {
  const typedRef = useRef(false)

  useEffect(() => {
    if (typedRef.current) return
    typedRef.current = true

    const lines = document.querySelectorAll('.type-line')
    let delay = 200
    lines.forEach(line => {
      const text = line.dataset.text || line.textContent
      line.textContent = ''
      line.style.opacity = '1'
      setTimeout(() => {
        let i = 0
        const interval = setInterval(() => {
          line.textContent = text.slice(0, ++i)
          if (i >= text.length) clearInterval(interval)
        }, 22)
      }, delay)
      delay += text.length * 22 + 300
    })
  }, [])

  return (
    <div className="terminal-wrap" style={{ position: 'relative' }}>
      <Hyperspeed />
      <div className="scanlines" />
      <div className="crt-vignette" />

      <header className="term-topbar">
        <div className="term-dots">
          <div className="term-dot" /><div className="term-dot" /><div className="term-dot" />
        </div>
        <span className="term-path">
          <strong>aabid</strong>@portfolio:<strong>~/projects</strong> $&nbsp;
          <span style={{ animation: 'blink .8s step-end infinite' }}>▮</span>
        </span>
        <span style={{ marginLeft: 'auto', color: 'rgba(0,255,65,.3)', fontSize: '.65rem', letterSpacing: '2px' }}>02 / 05</span>
      </header>

      <main className="term-body">
        <div className="term-intro" style={{ marginBottom: '2.5rem' }}>
          <div className="term-line" style={{ opacity: 0 }}>
            <span className="prompt">$</span>
            <span className="cmd type-line" data-text="ls -la ./projects --all --verbose">&nbsp;</span>
          </div>
          <div className="term-line" style={{ marginTop: '.8rem', opacity: 0 }}>
            <span className="comment type-line" data-text="// Found 3 projects — sorted by impact desc">&nbsp;</span>
          </div>
          <div className="term-line" style={{ marginTop: '.3rem', opacity: 0 }}>
            <span className="comment type-line" data-text="// Rendering results...">&nbsp;</span>
          </div>
        </div>

        <div className="proj-grid">
          <article className="proj-card" id="proj-0">
            <span className="proj-num">01</span>
            <div className="proj-header">
              <span className="proj-dir">drwxr-xr-x &nbsp; Bhookie/</span>
              <span className="proj-status">DEPLOYED</span>
            </div>
            <h2 className="proj-title">Bhookie (UK Restaurant)</h2>
            <p className="proj-desc">Worked in a team to build the Bhookie restaurant website. Contributed to the frontend using React (React + HTML + JSS styling) and also implemented backend functionality for the site.</p>
            <div className="proj-stack">
              {['React','HTML','JSS','Backend','Team Project'].map(t => <span key={t} className="proj-tag">{t}</span>)}
            </div>
            <a href="https://bhookie.com/" className="proj-link" target="_blank" rel="noopener noreferrer">$ open ./bhookie <span>→</span></a>
          </article>

          <article className="proj-card" id="proj-1">
            <span className="proj-num">02</span>
            <div className="proj-header">
              <span className="proj-dir">drwxr-xr-x &nbsp; zuvika/</span>
              <span className="proj-status">ACTIVE</span>
            </div>
            <h2 className="proj-title">Zuvika (Salon)</h2>
            <p className="proj-desc">Built a website for a salon with HTML, JavaScript, and CSS, then hosted the site from scratch for public access with a domain using firebase. Learning customer interaction with direct client communication. The site is actively maintained by me.</p>
            <div className="proj-stack">
              {['HTML','JavaScript','CSS','Freelance','Hosting'].map(t => <span key={t} className="proj-tag">{t}</span>)}
            </div>
            <a href="https://zuvikasalon.com/" className="proj-link" target="_blank" rel="noopener noreferrer">$ open ./zuvika <span>→</span></a>
          </article>

          <article className="proj-card" id="proj-2">
            <span className="proj-num">03</span>
            <div className="proj-header">
              <span className="proj-dir">drwxr-xr-x &nbsp; air-tix/</span>
              <span className="proj-status">LIVE</span>
            </div>
            <h2 className="proj-title">Airline Ticketing Replica</h2>
            <p className="proj-desc">Solo-built working replica of an airline ticketing application. Initially implemented using Servlets, then adapted to run without Java (pure HTML-based version) and hosted it live using Firebase.</p>
            <div className="proj-stack">
              {['Servlets','HTML','Firebase Hosting','Solo Project'].map(t => <span key={t} className="proj-tag">{t}</span>)}
            </div>
            <a href="https://airlines44.web.app/" className="proj-link" target="_blank" rel="noopener noreferrer">$ open ./air-tix <span>→</span></a>
          </article>
        </div>

        <div style={{ marginTop: '3rem', color: 'rgba(0,255,65,.3)', fontSize: '.75rem', letterSpacing: '2px', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>3 directories listed</span>
          <span>0 errors</span>
          <span style={{ color: 'rgba(0,255,65,.5)' }}>exit code: 0 ✓</span>
          <span style={{ marginLeft: 'auto' }}>
            <a href="/journey" onClick={e => { e.preventDefault(); onNavigate('/journey') }}
              style={{ color: 'rgba(0,255,65,.4)', letterSpacing: '2px', fontSize: '.65rem', transition: 'color .2s' }}
              onMouseOver={e => e.target.style.color='#00ff41'}
              onMouseOut={e => e.target.style.color='rgba(0,255,65,.4)'}
            >$ cd ../journey →</a>
          </span>
        </div>
      </main>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
