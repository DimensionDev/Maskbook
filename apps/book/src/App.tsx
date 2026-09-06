import { useEffect, useState } from 'react'
import { Nav } from './components/Nav.tsx'
import { Canvas } from './components/Canvas.tsx'
import { allEntries, findEntry } from './registry.ts'
import { useRoute } from './router.ts'

export function App() {
    const [route, navigate] = useRoute()
    const entry = findEntry(route)
    const [navOpen, setNavOpen] = useState(false)

    // land on the first demo if the hash is empty or stale
    useEffect(() => {
        if (!entry && allEntries.length > 0) navigate(allEntries[0].id)
    }, [entry, navigate])

    // close the mobile drawer whenever a demo is picked
    const handleNavigate = (id: string) => {
        navigate(id)
        setNavOpen(false)
    }

    return (
        <div className="book-shell" data-nav-open={navOpen}>
            <button
                type="button"
                className="book-menu-button"
                aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={navOpen}
                onClick={() => setNavOpen((open) => !open)}>
                {navOpen ? '✕' : '☰'}
            </button>
            <Nav current={route} onNavigate={handleNavigate} />
            {navOpen ?
                <div className="book-backdrop" onClick={() => setNavOpen(false)} />
            :   null}
            <Canvas entry={entry} />
        </div>
    )
}
