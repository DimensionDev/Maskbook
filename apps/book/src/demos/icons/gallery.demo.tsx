import { useDeferredValue, useMemo, useState } from 'react'
import { Icons } from '@masknet/icons'

export const meta = {
    title: 'Icon gallery',
    description: 'Every export from @masknet/icons. Type to filter; click to copy the name.',
}

const ALL = Object.keys(Icons)
    .filter((name) => /^[A-Z]/.test(name))
    .sort()

export default function IconGalleryDemo() {
    const [query, setQuery] = useState('')
    const deferred = useDeferredValue(query)
    const [copied, setCopied] = useState<string | null>(null)

    const list = useMemo(() => {
        const q = deferred.trim().toLowerCase()
        return q ? ALL.filter((name) => name.toLowerCase().includes(q)) : ALL
    }, [deferred])

    return (
        <div>
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Filter ${ALL.length} icons…`}
                style={{
                    width: 280,
                    padding: '8px 10px',
                    marginBottom: 16,
                    borderRadius: 8,
                    border: '1px solid var(--book-border)',
                    background: 'transparent',
                    color: 'inherit',
                }}
            />
            <div style={{ marginBottom: 12, color: 'var(--book-muted)', fontSize: 12 }}>
                {list.length} shown{copied ? ` · copied "${copied}"` : ''}
            </div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                    gap: 8,
                }}>
                {list.map((name) => {
                    const Icon = (Icons as Record<string, React.ComponentType<{ size?: number }>>)[name]
                    return (
                        <button
                            key={name}
                            type="button"
                            title={name}
                            onClick={() => {
                                navigator.clipboard?.writeText(name)
                                setCopied(name)
                            }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                                padding: '12px 6px',
                                border: '1px solid var(--book-border)',
                                borderRadius: 10,
                                background: 'transparent',
                                color: 'inherit',
                                cursor: 'pointer',
                                overflow: 'hidden',
                            }}>
                            <Icon size={24} />
                            <span
                                style={{
                                    fontSize: 10,
                                    color: 'var(--book-muted)',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                {name}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
