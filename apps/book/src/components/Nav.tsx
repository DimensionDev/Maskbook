import { Fragment } from 'react'
import { groupTitle, sections } from '../registry.ts'
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

            {sections.map((section) => {
                let lastGroup: string | undefined
                return (
                    <div key={section.id}>
                        <div className="book-section-title">{section.title}</div>
                        {section.entries.map((entry) => {
                            const showGroupHeader = entry.group !== lastGroup
                            lastGroup = entry.group
                            return (
                                <Fragment key={entry.id}>
                                    {showGroupHeader && entry.group ?
                                        <div className="book-group-title">{groupTitle(entry.group)}</div>
                                    :   null}
                                    <button
                                        type="button"
                                        className="book-nav-link"
                                        data-active={entry.id === current}
                                        data-grouped={!!entry.group}
                                        onClick={() => onNavigate(entry.id)}>
                                        {entry.name}
                                    </button>
                                </Fragment>
                            )
                        })}
                    </div>
                )
            })}
        </nav>
    )
}
