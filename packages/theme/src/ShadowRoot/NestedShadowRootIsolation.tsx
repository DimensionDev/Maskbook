import { useState, useContext, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { StyleSheetsContext } from './Contexts'

/**
 * Render it's children inside a ShadowRoot to provide style isolation.
 *
 * It MUST under a <ShadowRootStyleProvider /> component.
 */
export function NestedShadowRootIsolation({
    children,
    ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>) {
    const [dom, setDOM] = useState<HTMLSpanElement | null>()
    const sheets = useContext(StyleSheetsContext)

    const container = useRef<HTMLDivElement>()
    if (!container.current) {
        container.current = document.createElement('div')
    }
    useLayoutEffect(() => {
        if (!dom) return
        if (dom.shadowRoot) return

        const shadow = dom.attachShadow({ mode: 'open' })
        shadow.appendChild(container.current!)

        sheets.map((x) => x.addContainer(shadow))
    }, [dom])

    return (
        <span {...props} ref={setDOM}>
            {createPortal(children, container.current)}
        </span>
    )
}
