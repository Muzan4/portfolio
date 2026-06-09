import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import NavMenu from './components/NavMenu'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Journey from './pages/Journey'
import Universe from './pages/Universe'
import Contact from './pages/Contact'

/* ── Page theme map ── */
const PAGE_THEMES = {
  '/':         { label: 'HOME',     color: '#3b93f6', font: 'Orbitron',        cls: 'page-home' },
  '/projects': { label: 'PROJECTS', color: '#00ff41', font: 'JetBrains Mono',  cls: 'page-projects' },
  '/journey':  { label: 'JOURNEY',  color: '#9b30ff', font: 'Anton',           cls: 'page-journey' },
  '/universe': { label: 'UNIVERSE', color: '#f4a261', font: 'Playfair Display', cls: 'page-universe' },
  '/contact':  { label: 'CONNECT',  color: '#4cc9f0', font: 'Space Mono',      cls: 'page-contact' },
}

export default function App() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const ptRef     = useRef(null)
  const curRef    = useRef(null)
  const ringRef   = useRef(null)
  const mx = useRef(0), my = useRef(0), rx = useRef(0), ry = useRef(0)
  const rafIdRef  = useRef(null)
  const menuOpen  = useRef(false)

  const theme = PAGE_THEMES[location.pathname] || PAGE_THEMES['/']

  /* ── Apply page class to <body> ── */
  useEffect(() => {
    const body = document.body
    Object.values(PAGE_THEMES).forEach(t => body.classList.remove(t.cls))
    body.classList.add(theme.cls)
    return () => body.classList.remove(theme.cls)
  }, [location.pathname, theme.cls])

  /* ── Custom cursor ── */
  useEffect(() => {
    const cur  = curRef.current
    const ring = ringRef.current
    if (!cur || !ring) return

    const onMove = e => {
      mx.current = e.clientX; my.current = e.clientY
      cur.style.left = e.clientX + 'px'
      cur.style.top  = e.clientY + 'px'
    }
    document.addEventListener('mousemove', onMove, { passive: true })

    const animRing = () => {
      rx.current += (mx.current - rx.current) * 0.18
      ry.current += (my.current - ry.current) * 0.18
      ring.style.left = rx.current + 'px'
      ring.style.top  = ry.current + 'px'
      rafIdRef.current = requestAnimationFrame(animRing)
    }
    rafIdRef.current = requestAnimationFrame(animRing)

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafIdRef.current)
    }
  }, [])

  /* ── Scroll progress ── */
  useEffect(() => {
    const bar = document.getElementById('scroll-progress')
    if (!bar) return
    const onScroll = () => {
      const s = document.documentElement.scrollTop
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (h > 0) bar.style.width = (s / h * 100) + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  /* ── Page transition: slide in on route change ── */
  useEffect(() => {
    const pt = ptRef.current
    if (!pt) return
    // Page just mounted — slide overlay off
    requestAnimationFrame(() => {
      pt.style.transform = 'translateY(-100%)'
    })
  }, [location.pathname])

  /* ── Navigate with transition ── */
  const navigateTo = (href) => {
    const pt = ptRef.current
    if (!pt) { navigate(href); return }

    const destTheme = Object.entries(PAGE_THEMES).find(([path]) =>
      href === path || href === path + '/'
    )?.[1] || theme

    pt.style.background = destTheme.color
    const lbl = pt.querySelector('#pt-label')
    if (lbl) { lbl.textContent = destTheme.label; lbl.style.fontFamily = `"${destTheme.font}", sans-serif` }

    pt.style.transition = 'none'
    pt.style.transform  = 'translateY(100%)'

    requestAnimationFrame(() => requestAnimationFrame(() => {
      pt.style.transition = 'transform .6s cubic-bezier(0.77,0,0.175,1)'
      pt.style.transform  = 'translateY(0%)'
    }))

    setTimeout(() => navigate(href), 640)
  }

  return (
    <>
      {/* Custom cursor */}
      <div id="cursor"      ref={curRef}  />
      <div id="cursor-ring" ref={ringRef} />

      {/* Scroll progress */}
      <div id="scroll-progress" />

      {/* Page transition overlay */}
      <div
        id="pt"
        ref={ptRef}
        style={{ background: theme.color, transform: 'translateY(0%)' }}
      >
        <span
          id="pt-label"
          style={{ fontFamily: `"${theme.font}", sans-serif` }}
        >
          {theme.label}
        </span>
      </div>

      {/* Full-screen nav menu */}
      <NavMenu onNavigate={navigateTo} />

      {/* Page routes */}
      <Routes>
        <Route path="/"         element={<Home      onNavigate={navigateTo} />} />
        <Route path="/projects" element={<Projects  onNavigate={navigateTo} />} />
        <Route path="/journey"  element={<Journey   onNavigate={navigateTo} />} />
        <Route path="/universe" element={<Universe  onNavigate={navigateTo} />} />
        <Route path="/contact"  element={<Contact   onNavigate={navigateTo} />} />
      </Routes>
    </>
  )
}
