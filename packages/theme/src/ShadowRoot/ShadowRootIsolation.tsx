import { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { ShadowRootStyleProvider } from './ShadowRootStyleProvider'

/**
 * Render it's children inside a ShadowRoot to provide style isolation.
 */
export function ShadowRootIsolation({
    children,
    ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>) {
    const [dom, setDOM] = useState<HTMLSpanElement | null>()

    const container = useRef<HTMLDivElement>()
    if (!container.current) {
        container.current = document.createElement('div')
    }
    useLayoutEffect(() => {
        if (!dom) return
        if (dom.shadowRoot) return

        const shadow = dom.attachShadow({ mode: 'open' })
        shadow.appendChild(container.current!)
    }, [dom])

    if (!dom?.shadowRoot) return <span {...props} ref={(x) => (x !== dom ? setDOM(x) : undefined)} />

    return (
        <span {...props}>
            <ShadowRootStyleProvider shadow={dom.shadowRoot}>
                {createPortal(children, container.current)}
            </ShadowRootStyleProvider>
        </span>
    )
}
