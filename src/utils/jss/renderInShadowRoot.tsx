import { create, Jss, SheetsRegistry } from 'jss'
import { jssPreset, StylesProvider, ThemeProvider } from '@material-ui/styles'
import ReactDOM from 'react-dom'
import React from 'react'
import type {} from 'react/experimental'
import type {} from 'react-dom/experimental'
import { getActivatedUI } from '../../social-network/ui'
import { renderInShadowRootSettings } from '../../components/shared-settings/settings'
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
        shadow(): ShadowRoot
        normal(): HTMLElement
        concurrent?: boolean
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
                    <Maskbook children={node} />
                </ErrorBoundary>,
                config.concurrent,
            )
        }
        setTimeout(() => {
            if (!(element instanceof ShadowRoot)) throw new Error()
            // ! DOMRender requires the element inside document
            if (element.host.parentNode === null) tryRender()
            else {
                rendered = true
                unmount = mount(
                    element,
                    <ErrorBoundary>
                        <RenderInShadowRootWrapper shadow={element}>
                            <Maskbook children={node} />
                        </RenderInShadowRootWrapper>
                    </ErrorBoundary>,
                    config.concurrent,
                )
            }
        })
    }
    renderInShadowRootSettings.readyPromise.then(tryRender)
    return () => rendered && unmount()
}

function mount(e: (HTMLElement & ShadowRoot) | HTMLElement, _: JSX.Element, concurrent?: boolean) {
    if (concurrent) {
        const root = ReactDOM.createRoot(e)
        root.render(_)
        return () => root.unmount()
    } else {
        ReactDOM.render(_, e)
        return () => ReactDOM.unmountComponentAtNode(e)
    }
}

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

export const jssRegistryMap: WeakMap<ShadowRoot, InformativeSheetsRegistry> = new WeakMap()

export const useSheetsRegistryStyles = (_current: Node | null) => {
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
            subscribe: (callback: any) => registry?.addListener(callback) ?? (() => 0),
        }
    }, [_current])
    return useSubscription(subscription)
}

interface RenderInShadowRootWrapperProps {
    shadow: ShadowRoot
}

class RenderInShadowRootWrapper extends React.PureComponent<RenderInShadowRootWrapperProps> {
    proxy: HTMLElement = new Proxy(this.props.shadow as any, {
        get(target, property: keyof ShadowRoot) {
            if (property === 'parentNode') {
                const host = target.getRootNode({ composed: true })
                if (host !== document) {
                    // ! severe error! The style cannot be managed by DOMRender
                    return null
                }
                return target
            }
            return target[property]
        },
    })
    jss: Jss = create({
        ...jssPreset(),
        insertionPoint: this.proxy,
    })
    registry: InformativeSheetsRegistry = new InformativeSheetsRegistry()
    manager = new WeakMap()
    constructor(props: RenderInShadowRootWrapperProps) {
        super(props)
        jssRegistryMap.set(props.shadow, this.registry)
    }
    render() {
        return (
            // ! sheetsRegistry: We use this to get styles as a whole string
            // ! sheetsManager: Material-ui uses this to detect if the style has been rendered
            <StylesProvider
                sheetsRegistry={this.registry}
                jss={this.jss}
                sheetsManager={this.manager}
                children={this.props.children}
            />
        )
    }
}

class ErrorBoundary extends React.Component {
    state: { error?: Error } = { error: undefined }
    render() {
        if (this.state.error) return <pre style={{ whiteSpace: 'break-spaces' }}>{this.state.error.message}</pre>
        return this.props.children
    }
    componentDidCatch(error: Error) {
        this.setState({ error })
    }
}

import { SnackbarProvider } from 'notistack'
type MaskbookProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

function Maskbook(_props: MaskbookProps) {
    const theme = getActivatedUI().useTheme()
    return (
        <ThemeProvider theme={theme}>
            <I18nextProvider i18n={i18nNextInstance}>
                <React.StrictMode>
                    <SnackbarProvider
                        maxSnack={30}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}>
                        <div {..._props} />
                    </SnackbarProvider>
                </React.StrictMode>
            </I18nextProvider>
        </ThemeProvider>
    )
}
