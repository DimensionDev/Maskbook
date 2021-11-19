import { useTheme } from '@mui/material'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCSSVariableInjector } from './CSSVariableInjector'
import { ShadowRootStyleProvider } from './ShadowRootStyleProvider'

export function StyleIsolatePortal({ children, ...rest }: JSX.IntrinsicElements['span']) {
    const [host, setHost] = useState<HTMLSpanElement | null>()
    const main = useRef<HTMLElement>()
    const head = useRef<HTMLHeadElement>()
    if (!main.current || !host) {
        return (
            <span
                {...rest}
                ref={(ref) => {
                    if (host === ref) return
                    setHost(ref)
                    if (!ref) return
                    if (ref.shadowRoot) return
                    const shadow = ref.attachShadow({ mode: 'open' })
                    const _main = (main.current = document.createElement('main'))
                    const _head = (head.current = document.createElement('head'))
                    shadow.append(_main, _head)
                }}
            />
        )
    }
    return (
        <span {...rest}>
            <ShadowRootStyleProvider shadow={host!.shadowRoot!}>
                <CSSVariableInjector head={head.current} />
                <main>{createPortal(children, main.current)}</main>
            </ShadowRootStyleProvider>
        </span>
    )
}

function CSSVariableInjector(props: { head?: HTMLHeadElement }) {
    useCSSVariableInjector(useTheme, props.head || null)
    return null
}
