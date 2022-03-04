import { createContext, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const Context = createContext(null)

export interface ShadowRootIsolationProviderProps extends React.PropsWithChildren<{}> {}
/**
 * This component render it's children inside a ShadowRoot
 * and fixes the ShadowRoot support for emotion
 */
export function ShadowRootIsolationProvider(props: ShadowRootIsolationProviderProps) {
    const [dom, setDOM] = useState<HTMLDivElement | null>()

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

    return <div ref={setDOM}>{createPortal(props.children, container.current)}</div>
}
