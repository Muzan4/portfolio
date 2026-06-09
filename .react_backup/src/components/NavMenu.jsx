import { useState } from 'react'
import { useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { num: '01', name: 'HOME',     desc: 'The Void',    path: '/',         cls: 'mi-home' },
  { num: '02', name: 'PROJECTS', desc: 'The Terminal', path: '/projects', cls: 'mi-projects' },
  { num: '03', name: 'JOURNEY',  desc: 'Synthwave',   path: '/journey',  cls: 'mi-journey' },
  { num: '04', name: 'UNIVERSE', desc: 'The Ember',   path: '/universe', cls: 'mi-universe' },
  { num: '05', name: 'CONNECT',  desc: 'Blueprint',   path: '/contact',  cls: 'mi-contact' },
]

export default function NavMenu({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const toggle = () => setOpen(o => !o)
  const close  = () => setOpen(false)

  const handleClick = (e, path) => {
    e.preventDefault()
    close()
    if (path !== location.pathname) onNavigate(path)
  }

  return (
    <>
      <div id="fullmenu" className={open ? 'open' : ''} aria-label="Navigation">
        {NAV_ITEMS.map(item => (
          <a
            key={item.path}
            href={item.path}
            className={`mi ${item.cls}`}
            onClick={e => handleClick(e, item.path)}
          >
            <span className="mi-num">{item.num}</span>
            <span className="mi-name">{item.name}</span>
            <span className="mi-desc">{item.desc}</span>
            <span className="mi-arrow">↗</span>
          </a>
        ))}
      </div>

      <button
        id="menu-btn"
        className={open ? 'open' : ''}
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={toggle}
      >
        <span /><span /><span />
      </button>
    </>
  )
}
