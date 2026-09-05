import { Suspense, lazy, useMemo } from 'react'
import type { DemoEntry } from '../demo.ts'

interface Props {
    entry: DemoEntry | undefined
}

export function Canvas({ entry }: Props) {
    if (!entry) {
        return (
            <div className="book-main">
                <div className="book-empty">Pick a component from the sidebar.</div>
            </div>
        )
    }
    return <DemoView key={entry.id} entry={entry} />
}

function DemoView({ entry }: { entry: DemoEntry }) {
    const Body = useMemo(
        () =>
            lazy(async () => {
                const mod = await entry.load()
                const Demo = mod.default
                const description = mod.meta?.description
                return {
                    default: () => (
                        <>
                            <header className="book-main-header">
                                <h1>{mod.meta?.title ?? entry.name}</h1>
                                {description ?
                                    <p>{description}</p>
                                :   null}
                            </header>
                            <div className="book-canvas">
                                <Demo />
                            </div>
                        </>
                    ),
                }
            }),
        [entry],
    )

    return (
        <div className="book-main">
            <Suspense fallback={<div className="book-empty">Loading…</div>}>
                <Body />
            </Suspense>
        </div>
    )
}
