import { useEffect } from 'react'

export default function Contact({ onNavigate }) {
  useEffect(() => {
    const form = document.getElementById('contact-form')
    if (!form) return

    const onSubmit = e => {
      e.preventDefault()
      const btn = form.querySelector('.submit-btn')
      const btnText = btn.querySelector('span')
      btnText.textContent = '// TRANSMITTING...'

      setTimeout(() => {
        btnText.textContent = '// SIGNAL RECEIVED ✓'
        btn.style.borderColor = '#2ecc71'
        btn.style.color = '#2ecc71'
        form.reset()
        setTimeout(() => {
          btnText.textContent = 'TRANSMIT_MESSAGE()'
          btn.style.borderColor = ''
          btn.style.color = ''
        }, 3500)
      }, 1600)
    }

    form.addEventListener('submit', onSubmit)
    return () => form.removeEventListener('submit', onSubmit)
  }, [])

  return (
    <div className="contact-wrap">
      {/* Blueprint grid background */}
      <div className="blueprint-bg" />

      {/* Blueprint corner annotations */}
      <div className="bp-corner bp-tl">AABID.PORTFOLIO<br/>REV 2026.06 · DOC-05</div>
      <div className="bp-corner bp-tr">STATUS: AVAILABLE<br/>LOCATION: GLOBAL</div>
      <div class="bp-corner bp-bl">SCALE 1:1<br/>UNITS: PIXELS</div>
      <div class="bp-corner bp-br">05 / 05<br/>CONTACT MODULE</div>

      {/* Left: Info panel */}
      <aside className="contact-info">
        <p className="contact-eyebrow">// MODULE_05 · CONTACT</p>

        <h1 className="contact-title">
          Let's Build<br/><span>Something</span><br/>Real.
        </h1>

        <p className="contact-desc">
          Whether it's a product that doesn't exist yet, a team that needs a
          developer who thinks like a designer, or just a conversation worth having —
          I'm listening.
        </p>

        <div className="contact-coords">
          <div className="coord-row">
            <span className="coord-label">EMAIL</span>
            <span className="coord-value"><a href="mailto:aabid@example.com">aabid@example.com</a></span>
          </div>
          <div className="coord-row">
            <span className="coord-label">GITHUB</span>
            <span className="coord-value"><a href="#">/github/aabid</a></span>
          </div>
          <div className="coord-row">
            <span className="coord-label">LINKEDIN</span>
            <span className="coord-value"><a href="#">/in/aabid</a></span>
          </div>
          <div className="coord-row">
            <span className="coord-label">TWITTER</span>
            <span className="coord-value"><a href="#">@aabid</a></span>
          </div>
          <div className="coord-row">
            <span className="coord-label">TIMEZONE</span>
            <span className="coord-value">IST · UTC+5:30</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          <a href="#" title="GitHub" style={{ width: '40px', height: '40px', border: '1px solid rgba(76,201,240,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(76,201,240,.6)', transition: 'all .3s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='rgba(76,201,240,.6)'; e.currentTarget.style.color='#4cc9f0'; e.currentTarget.style.boxShadow='0 0 20px rgba(76,201,240,.15)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor='rgba(76,201,240,.2)'; e.currentTarget.style.color='rgba(76,201,240,.6)'; e.currentTarget.style.boxShadow='none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a href="#" title="LinkedIn" style={{ width: '40px', height: '40px', border: '1px solid rgba(76,201,240,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(76,201,240,.6)', transition: 'all .3s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='rgba(76,201,240,.6)'; e.currentTarget.style.color='#4cc9f0' }}
            onMouseOut={e => { e.currentTarget.style.borderColor='rgba(76,201,240,.2)'; e.currentTarget.style.color='rgba(76,201,240,.6)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="#" title="Twitter" style={{ width: '40px', height: '40px', border: '1px solid rgba(76,201,240,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(76,201,240,.6)', transition: 'all .3s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='rgba(76,201,240,.6)'; e.currentTarget.style.color='#4cc9f0' }}
            onMouseOut={e => { e.currentTarget.style.borderColor='rgba(76,201,240,.2)'; e.currentTarget.style.color='rgba(76,201,240,.6)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>
      </aside>

      {/* Right: Form panel */}
      <div className="contact-form-wrap">
        <p className="form-title">INITIATE_CONTACT</p>

        <form className="contact-form" id="contact-form" noValidate>
          <div className="form-row">
            <div className="field">
              <label htmlFor="name">NAME_PARAM</label>
              <input type="text" id="name" name="name" placeholder="Your name" autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="email">EMAIL_PARAM</label>
              <input type="email" id="email" name="email" placeholder="your@email.com" autoComplete="off" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="subject">SUBJECT_PARAM</label>
            <input type="text" id="subject" name="subject" placeholder="What's the mission?" autoComplete="off" />
          </div>

          <div className="field">
            <label htmlFor="message">MESSAGE_BODY</label>
            <textarea id="message" name="message" placeholder="Describe your vision, project, or just say hello..."></textarea>
          </div>

          <button type="submit" className="submit-btn" id="submit-btn">
            <span>TRANSMIT_MESSAGE()</span>
          </button>
        </form>

        <div style={{ position: 'absolute', bottom: '3rem', right: '3rem', opacity: '.15', pointerEvents: 'none' }}>
          <div style={{ position: 'relative', width: '40px', height: '40px' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#4cc9f0', transform: 'translateY(-50%)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: '#4cc9f0', transform: 'translateX(-50%)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '10px', height: '10px', border: '1px solid #4cc9f0', borderRadius: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
