import { sections } from '../registry.ts'
import { useMode } from '../providers.tsx'

interface Props {
    current: string
    onNavigate: (id: string) => void
}

export function Nav({ current, onNavigate }: Props) {
    const { mode, toggle } = useMode()
    return (
        <nav className="book-sidebar">
            <div className="book-brand">
                <span>Mask Component Book</span>
                <button type="button" className="book-theme-toggle" onClick={toggle}>
                    {mode === 'light' ? '◐ Light' : '◑ Dark'}
                </button>
            </div>

            {sections.map((section) => (
                <div key={section.id}>
                    <div className="book-section-title">{section.title}</div>
                    {section.entries.map((entry) => (
                        <button
                            type="button"
                            key={entry.id}
                            className="book-nav-link"
                            data-active={entry.id === current}
                            onClick={() => onNavigate(entry.id)}>
                            {entry.name}
                        </button>
                    ))}
                </div>
            ))}
        </nav>
    )
}
