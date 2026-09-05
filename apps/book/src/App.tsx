import { useEffect } from 'react'
import { Nav } from './components/Nav.tsx'
import { Canvas } from './components/Canvas.tsx'
import { allEntries, findEntry } from './registry.ts'
import { useRoute } from './router.ts'

export function App() {
    const [route, navigate] = useRoute()
    const entry = findEntry(route)

    // land on the first demo if the hash is empty or stale
    useEffect(() => {
        if (!entry && allEntries.length > 0) navigate(allEntries[0].id)
    }, [entry, navigate])

    return (
        <div className="book-shell">
            <Nav current={route} onNavigate={navigate} />
            <Canvas entry={entry} />
        </div>
    )
}
