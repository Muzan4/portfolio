import { useEffect, useRef } from 'react'
import FluidGlass from '../components/FluidGlass'

export default function Universe({ onNavigate }) {
  const cardsRef = useRef([])

  /* Intersection observer for hobby card reveal */
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.15 })

    const cards = document.querySelectorAll('.hobby-card')
    cards.forEach(c => obs.observe(c))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* FluidGlass lens — fixed fullscreen, pointer-events none so page is interactive */}
      <div className="fluid-glass-wrapper">
        <FluidGlass
          mode="lens"
          lensProps={{
            scale: 0.25,
            ior: 1.15,
            thickness: 5,
            chromaticAberration: 0.1,
            anisotropy: 0.01,
          }}
        />
      </div>

      {/* Warm ember background */}
      <div className="ember-bg" />

      <div className="uni-content">
        {/* Hero */}
        <section className="uni-hero">
          <p className="uni-eyebrow">04 &nbsp;/&nbsp; 05 &nbsp;·&nbsp; BEYOND THE CODE</p>

          <h1 className="uni-title">
            My Own Little<br />
            <em>Universe</em>
          </h1>

          <p className="uni-desc">
            Technology is what I build, but curiosity is what drives me.
            These are the worlds I wander when the screen goes dark —
            each one a different lens on the same drive to explore.
          </p>

          <div style={{ width: '4rem', height: '1px', background: 'linear-gradient(90deg,#f4a261,transparent)', marginBottom: '1rem' }} />
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '.75rem', fontStyle: 'italic', color: 'rgba(244,162,97,.5)', letterSpacing: '3px' }}>
            Scroll to explore
          </span>
        </section>

        {/* Hobbies */}
        <section className="hobbies-section">
          <p className="hobbies-label">Passions &amp; Pursuits</p>

          <div className="hobby-grid">
            <article className="hobby-card" data-char="📷">
              <span className="hobby-icon">📷</span>
              <h2 className="hobby-name">Photography</h2>
              <p className="hobby-sub">Visual Storytelling</p>
              <p className="hobby-text">Every shutter click is a conversation with light. From the mathematical precision of macro shots to the raw chaos of street photography — I chase the frames that refuse to be ordinary. The camera teaches stillness in a world of noise.</p>
            </article>

            <article className="hobby-card" data-char="🎮">
              <span className="hobby-icon">🎮</span>
              <h2 className="hobby-name">Gaming</h2>
              <p className="hobby-sub">Interactive Worlds</p>
              <p className="hobby-text">Games are the greatest interactive medium humanity has invented. I study their design as much as I play them — the decision trees, the emergent narratives, the way a perfectly-tuned system can create genuine emotion from pixels and sound.</p>
            </article>

            <article className="hobby-card" data-char="⛰">
              <span className="hobby-icon">⛰️</span>
              <h2 className="hobby-name">Hiking</h2>
              <p className="hobby-sub">Summit Seeking</p>
              <p className="hobby-text">The mountain doesn't care about your deadlines. Each ascent is a reset — a reminder that the best problems require patience, rhythm, and willingness to be uncomfortable. Nature is the greatest senior engineer I've ever worked with.</p>
            </article>
          </div>
        </section>

        {/* Quote */}
        <section style={{ padding: '6rem 8vw', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: "'Playfair Display',serif", fontSize: 'min(20vw,16rem)', color: 'rgba(244,162,97,.04)', fontStyle: 'italic', pointerEvents: 'none', whiteSpace: 'nowrap', lineHeight: 1 }}>"</div>
          <blockquote style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.4rem,4vw,2.8rem)', fontStyle: 'italic', lineHeight: 1.5, color: 'rgba(255,248,238,.85)', maxWidth: '800px', margin: '0 auto 2rem' }}>
            The most creative engineers I know are the ones who have rich lives outside of engineering.
          </blockquote>
          <cite style={{ fontFamily: "'Inter',sans-serif", fontSize: '.75rem', letterSpacing: '4px', color: 'rgba(244,162,97,.5)', textTransform: 'uppercase', fontStyle: 'normal' }}>— A mentor's words</cite>
        </section>

        {/* Next page */}
        <div style={{ textAlign: 'center', padding: '0 0 8rem' }}>
          <a
            href="/contact"
            onClick={e => { e.preventDefault(); onNavigate('/contact') }}
            style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(244,162,97,.6)', transition: 'all .4s' }}
            onMouseOver={e => e.currentTarget.style.color = '#f4a261'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(244,162,97,.6)'}
          >
            Let's connect →
          </a>
        </div>
      </div>
    </>
  )
}
