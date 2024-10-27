/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-hooks/rules-of-hooks */
import { type DetailedHTMLProps, type HTMLAttributes, useContext, useLayoutEffect, useRef, useState } from 'react'
import { Flags } from '@masknet/flags'
import { createPortal } from 'react-dom'
import { DisableShadowRootContext } from './Contexts.js'
import { ShadowRootStyleProvider } from './ShadowRootStyleProvider.js'

type RootElement = HTMLDivElement | HTMLSpanElement

interface Props extends DetailedHTMLProps<HTMLAttributes<RootElement>, RootElement> {
    /** Tag name */
    rootElement?: 'div' | 'span' | (() => RootElement)
}

/**
 * Render it's children inside a ShadowRoot to provide style isolation.
 */
export function ShadowRootIsolation({ children, rootElement = 'div', ...props }: Props) {
    const disabled = useRef(useContext(DisableShadowRootContext)).current

    if (disabled) return <span {...props}>{children}</span>

    const [dom, setDOM] = useState<RootElement | null>()
    const container = useRef<RootElement>(undefined)

    if (!container.current) {
        container.current = typeof rootElement === 'function' ? rootElement() : document.createElement(rootElement)
    }
    useLayoutEffect(() => {
        if (!dom) return
        if (dom.shadowRoot) return

        // Note: ShadowRootIsolation is expected to use inside other closed ShadowRoot
        const shadow = dom.attachShadow({ ...Flags.shadowRootInit, mode: 'open', delegatesFocus: false })
        shadow.appendChild(container.current!)
    }, [dom])

    if (!dom?.shadowRoot) return <span {...props} ref={(x) => (x !== dom ? setDOM(x) : undefined)} />

    return (
        <span {...props}>
            <ShadowRootStyleProvider preventPropagation={false} shadow={dom.shadowRoot}>
                {createPortal(children, container.current)}
            </ShadowRootStyleProvider>
        </span>
    )
}
