import { create, SheetsRegistry } from 'jss'
import { jssPreset, StylesProvider, ThemeProvider } from '@material-ui/core/styles'
import ReactDOM from 'react-dom'
import React from 'react'
import type {} from 'react/experimental'
import type {} from 'react-dom/experimental'
import { getActivatedUI } from '../../social-network/ui'
import { renderInShadowRootSettings } from '../../settings/settings'
import { I18nextProvider } from 'react-i18next'
import i18nNextInstance from '../i18n-next'
import { portalShadowRoot } from './ShadowRootPortal'
import { useSubscription } from 'use-subscription'
import '../../components/InjectedComponents/ShadowRootSwitchNotifier'

const previousShadowedElement = new Set<HTMLElement>()
/**
 * Render the Node in the ShadowRoot
 * @param node React Node
 * @param shadow ShadowRoot that want to inject to
 */
export function renderInShadowRoot(
    node: React.ReactNode,
    config: {
        keyBy?: string
        shadow(): ShadowRoot
        normal(): HTMLElement
        concurrent?: boolean
        rootProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
    },
) {
    const get = (): HTMLElement => {
        const dom = config.normal()
        // ? Once it attached ShadowRoot, there is no way back
        if (previousShadowedElement.has(dom)) return config.shadow() as any
        if (renderInShadowRootSettings.value) {
            const shadow = config.shadow()
            previousShadowedElement.add(dom)
            if (shadow instanceof ShadowRoot && shadow.mode === 'open')
                console.warn('Do not render with open ShadowRoot!')
            return shadow as any
        }
        return dom
    }
    let rendered = false
    let unmount = () => {}
    const tryRender = () => {
        const element: HTMLElement = get()
        if (!(element instanceof ShadowRoot)) {
            rendered = true
            unmount = mount(
                element,
                <ErrorBoundary>
                    <Maskbook {...config.rootProps} children={node} />
                </ErrorBoundary>,
                config.keyBy,
                config.concurrent,
            )
        }
        setTimeout(() => {
            if (!(element instanceof ShadowRoot)) {
                console.log('Element = ', element)
                throw new Error('Element not instance of ShadowRoot')
            }
            // ! DOMRender requires the element inside document
            if (element.host.parentNode === null) tryRender()
            else {
                rendered = true
                unmount = mount(
                    element,
                    <ErrorBoundary>
                        <ShadowRootStyleProvider shadow={element}>
                            <Maskbook {...config.rootProps} children={node} />
                        </ShadowRootStyleProvider>
                    </ErrorBoundary>,
                    config.keyBy,
                    config.concurrent,
                )
            }
        })
    }
    renderInShadowRootSettings.readyPromise.then(tryRender)
    return () => rendered && unmount()
}

function mount(e: ({} | ShadowRoot) & HTMLElement, _: JSX.Element, keyBy = 'app', concurrent?: boolean) {
    const container =
        e.querySelector<HTMLElement>(`main.${keyBy}`) ||
        (() => {
            const dom = (e as ShadowRoot).appendChild(document.createElement('main'))
            dom.className = keyBy
            return dom
        })()
    if (concurrent) {
        const root = ReactDOM.unstable_createRoot(container)
        root.render(_)
        return () => root.unmount()
    } else {
        ReactDOM.render(_, container)
        return () => ReactDOM.unmountComponentAtNode(container)
    }
}
try {
    // After the hosting DOM node removed, the mutation watcher will receive the event in async
    // then unmount the React component.
    // but before the unmount, JSS might update the CSS of disconnected DOM then throws error.
    // These lines of code mute this kind of error in this case.
    const orig = Object.getOwnPropertyDescriptor(HTMLStyleElement.prototype, 'sheet')!
    Object.defineProperty(HTMLStyleElement.prototype, 'sheet', {
        ...orig,
        get(this: HTMLStyleElement) {
            if (this.isConnected) return orig.get!.call(this)
            return { cssRules: [], insertRule() {} }
        },
    })
} catch (e) {}

// ! let jss tell us if it has made an update
class InformativeSheetsRegistry extends SheetsRegistry {
    private callback = new Set<() => void>()
    private inform() {
        // ? Callback must be async or React will complain:
        // Warning: Cannot update a component from inside the function body of a different component.
        setTimeout(() => {
            // TODO: batch update
            // ? aggregating multiple inform request to one callback is possible
            for (const cb of this.callback) cb()
        })
    }
    addListener(cb: () => void) {
        this.callback.add(cb)
        return () => void this.callback.delete(cb)
    }
    add(...args: Parameters<SheetsRegistry['add']>) {
        super.add(...args)
        this.inform()
    }
    reset(...args: Parameters<SheetsRegistry['reset']>) {
        super.reset(...args)
        this.inform()
    }
    remove(...args: Parameters<SheetsRegistry['remove']>) {
        super.remove(...args)
        this.inform()
    }
}

const jssRegistryMap: WeakMap<ShadowRoot, InformativeSheetsRegistry> = new WeakMap()

export function useSheetsRegistryStyles(_current: Node | null) {
    const subscription = React.useMemo(() => {
        let registry: InformativeSheetsRegistry | null | undefined = null
        if (_current) {
            // ! lookup the styled shadowroot
            const current: Node = _current.getRootNode()
            if (current) {
                const shadowroot = current as ShadowRoot | undefined
                registry = shadowroot === portalShadowRoot ? null : jssRegistryMap.get(shadowroot as ShadowRoot)
            }
        }
        return {
            getCurrentValue: () => registry?.toString(),
            subscribe: (callback: () => void) => registry?.addListener(callback) ?? (() => 0),
        }
    }, [_current])
    return useSubscription(subscription)
}
const initOnceMap = new WeakMap<ShadowRoot, unknown>()
function initOnce<T>(keyBy: ShadowRoot, init: () => T): T {
    if (initOnceMap.has(keyBy)) return initOnceMap.get(keyBy) as T
    const val = init()
    initOnceMap.set(keyBy, val)
    return val
}
function ShadowRootStyleProvider({ shadow, ...props }: React.PropsWithChildren<{ shadow: ShadowRoot }>) {
    const { jss, registry, manager } = initOnce(shadow, () => {
        const insertionPoint = document.createElement('div')
        shadow.appendChild(document.createElement('head')).appendChild(insertionPoint)
        const jss = create({
            ...jssPreset(),
            insertionPoint: insertionPoint,
        })
        const registry = new InformativeSheetsRegistry()
        const manager = new WeakMap()
        jssRegistryMap.set(shadow, registry)
        return { jss, registry, manager }
    })
    return (
        // ! sheetsRegistry: We use this to get styles as a whole string
        // ! sheetsManager: Material-ui uses this to detect if the style has been rendered
        <StylesProvider sheetsRegistry={registry} jss={jss} sheetsManager={manager} children={props.children} />
    )
}

class ErrorBoundary extends React.Component {
    state: { error?: Error } = { error: undefined }
    render() {
        if (this.state.error) return <pre style={{ whiteSpace: 'break-spaces' }}>{this.state.error.message}</pre>
        return this.props.children
    }
    componentDidCatch(error: Error) {
        console.error(error)
        this.setState({ error })
    }
}

import { SnackbarProvider } from 'notistack'
type MaskbookProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>

function Maskbook(_props: MaskbookProps) {
    const theme = getActivatedUI().useTheme()
    return (
        <ThemeProvider theme={theme}>
            <I18nextProvider i18n={i18nNextInstance}>
                <SnackbarProvider maxSnack={30} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <React.StrictMode>
                        <span {..._props} />
                    </React.StrictMode>
                </SnackbarProvider>
            </I18nextProvider>
        </ThemeProvider>
    )
}
