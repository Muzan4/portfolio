import { useEffect } from 'react'

export default function Journey({ onNavigate }) {
  useEffect(() => {
    // Note: The original hyperspeed.js was wiped by the Vite scaffold.
    // It should be restored and called here.
    if (window.HyperspeedApp) window.HyperspeedApp.init()
  }, [])

  return (
    <>
      <div id="hyperspeed-container" />
      
      <div className="milestones-ui">
        <header className="journey-header">
          <p className="journey-eyebrow">03 &nbsp;/&nbsp; 05 &nbsp;·&nbsp; THE PATH</p>
          <h1 className="journey-title">JOURNEY</h1>
          <p className="journey-hint">Scroll to warp</p>
        </header>

        <div className="viewport-3d">
          <div className="warp-flash" id="warp-flash" />
          <div className="milestone-stage" id="milestone-stage">
            
            <article className="milestone-card tl-card" id="milestone-0">
              <span className="tl-icon">🚀</span>
              <h2 className="tl-year">2026</h2>
              <p className="tl-title">Senior Creative Engineer</p>
              <p className="tl-org">Future Corp</p>
              <p className="tl-desc">Leading the charge on next-generation web experiences bridging 3D and React.</p>
            </article>

            <article className="milestone-card tl-card is-hidden" id="milestone-1">
              <span className="tl-icon">⚡</span>
              <h2 className="tl-year">2024</h2>
              <p className="tl-title">Frontend Lead</p>
              <p className="tl-org">InnovateTech</p>
              <p className="tl-desc">Rebuilt the core platform from the ground up resulting in a 300% performance boost.</p>
            </article>

            <article className="milestone-card tl-card is-hidden" id="milestone-2">
              <span className="tl-icon">🎓</span>
              <h2 className="tl-year">2022</h2>
              <p className="tl-title">Computer Science</p>
              <p className="tl-org">University of Technology</p>
              <p className="tl-desc">Graduated with honors, focusing on graphics programming and human-computer interaction.</p>
            </article>

          </div>
        </div>

        <div className="journey-footer" id="journey-footer">
          <a href="/universe" onClick={e => { e.preventDefault(); onNavigate('/universe') }}
             style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.2rem', color: '#c084fc', letterSpacing: '2px', textDecoration: 'none' }}>
            ENTER THE UNIVERSE ↗
          </a>
        </div>
      </div>
    </>
  )
}
