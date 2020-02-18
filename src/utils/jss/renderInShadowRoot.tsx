import { create, Jss, SheetsRegistry } from 'jss'
import { jssPreset, StylesProvider, ThemeProvider } from '@material-ui/styles'
import ReactDOM from 'react-dom'
import React from 'react'
import { getActivatedUI } from '../../social-network/ui'
import { useValueRef } from '../hooks/useValueRef'
import { languageSettings } from '../../components/shared-settings/settings'
import { I18nextProvider } from 'react-i18next'
import i18nNextInstance from '../i18n-next'
import { portalShadowRoot } from './ShadowRootPortal'
import { useSubscription } from 'use-subscription'

/**
 * Render the Node in the ShadowRoot
 * @param node React Node
 * @param shadow ShadowRoot that want to inject to
 */
export function renderInShadowRoot(node: React.ReactNode, shadow: ShadowRoot) {
    if (shadow.mode === 'open') console.warn('Do not render with open ShadowRoot!')

    // ? how to pass props to class component?
    // @ts-ignore
    ReactDOM.render(<RenderInShadowRootWrapper children={node} shadow={shadow} />, shadow as any)
    return () => ReactDOM.unmountComponentAtNode(shadow as any)
}

// ! let jss tell us if it has made an update
class InformativeSheetsRegistry extends SheetsRegistry {
    private callback = new Set<() => void>()
    private inform() {
        // TODO: batch update
        // ? aggregating multiple inform request to one callback is possible
        for (const cb of this.callback) cb()
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
            let current: Node | null = _current
            while (
                current &&
                current.nodeType !== Node.DOCUMENT_NODE &&
                current.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
            ) {
                current = current.parentNode
            }
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
    node: React.ReactNode
    shadow: ShadowRoot
}

export class RenderInShadowRootWrapper extends React.PureComponent<RenderInShadowRootWrapperProps> {
    jss: Jss
    proxy: HTMLElement
    registry: InformativeSheetsRegistry
    constructor(props: RenderInShadowRootWrapperProps) {
        super(props)
        this.proxy = new Proxy(props.shadow as any, {
            get(target, property: keyof ShadowRoot) {
                if (property === 'parentNode') return target
                return target[property]
            },
        })
        this.jss = create({
            ...jssPreset(),
            insertionPoint: this.proxy,
        })
        this.registry = new InformativeSheetsRegistry()
        jssRegistryMap.set(props.shadow, this.registry)
    }
    state: { error?: Error } = { error: undefined }
    render() {
        if (this.state.error) return <pre style={{ whiteSpace: 'break-spaces' }}>{this.state.error.message}</pre>
        return <Maskbook sheetsRegistry={this.registry} jss={this.jss} children={this.props.children} />
    }
    componentDidCatch(error: Error) {
        this.setState({ error })
    }
}

type MaskbookProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    jss: Jss
    sheetsRegistry: SheetsRegistry
}

function Maskbook(_props: MaskbookProps) {
    const theme = getActivatedUI().useTheme()
    const lang = useValueRef(languageSettings)
    const { jss, sheetsRegistry, ...props } = _props
    return (
        <StylesProvider sheetsRegistry={sheetsRegistry} jss={jss}>
            <ThemeProvider theme={theme}>
                <I18nextProvider i18n={i18nNextInstance}>
                    <React.StrictMode>
                        <div {...props} />
                    </React.StrictMode>
                </I18nextProvider>
            </ThemeProvider>
        </StylesProvider>
    )
}
