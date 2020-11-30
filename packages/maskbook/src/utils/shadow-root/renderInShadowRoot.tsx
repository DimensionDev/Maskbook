import { create as createJSS, SheetsRegistry as JSSSheetsRegistry } from 'jss'
import { jssPreset, StylesProvider as JSSStylesProvider, ThemeProvider } from '@material-ui/core/styles'
import { CacheProvider as EmotionCacheProvider } from '@emotion/react'
import createEmotionCache, { EmotionCache } from '@emotion/cache'
import ReactDOM from 'react-dom'
import { useMemo, StrictMode } from 'react'
import type {} from 'react/experimental'
import type {} from 'react-dom/experimental'
import { getActivatedUI } from '../../social-network/ui'
import { I18nextProvider } from 'react-i18next'
import i18nNextInstance from '../i18n-next'
import { portalShadowRoot } from './ShadowRootPortal'
import { useSubscription } from 'use-subscription'
import { SnackbarProvider } from 'notistack'
import { ErrorBoundary } from '../../components/shared/ErrorBoundary'

const captureEvents: (keyof HTMLElementEventMap)[] = [
    'paste',
    'keydown',
    'keypress',
    'keyup',
    'drag',
    'dragend',
    'dragenter',
    'dragexit',
    'dragleave',
    'dragover',
    'dragstart',
    'change',
]
try {
    for (const each of captureEvents) {
        portalShadowRoot.addEventListener(each, (e) => e.stopPropagation())
    }
} catch {}
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
        concurrent?: boolean
        rootProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
    },
) {
    let rendered = false
    let unmount = () => {}
    const element: ShadowRoot = config.shadow()
    setTimeout(function tryRender() {
        // ! DOMRender requires the element inside document
        if (element.host.parentNode === null) setTimeout(tryRender)
        else {
            rendered = true
            unmount = mount(
                element,
                <ShadowRootStyleProvider shadow={element}>
                    <ErrorBoundary>
                        <Maskbook {...config.rootProps} children={node} />
                    </ErrorBoundary>
                </ShadowRootStyleProvider>,
                config.keyBy,
                config.concurrent,
            )
        }
    })
    return () => rendered && unmount()
}

function mount(host: ShadowRoot, _: JSX.Element, keyBy = 'app', concurrent?: boolean) {
    const container =
        host.querySelector<HTMLElement>(`main.${keyBy}`) ||
        (() => {
            const dom = host.appendChild(document.createElement('main'))
            dom.className = keyBy
            return dom
        })()
    for (const each of captureEvents) {
        host.addEventListener(each, (e) => e.stopPropagation())
    }
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

class Informative {
    private callback = new Set<() => void>()
    addListener(cb: () => void) {
        this.callback.add(cb)
        return () => void this.callback.delete(cb)
    }
    inform() {
        // ? Callback must be async or React will complain:
        // Warning: Cannot update a component from inside the function body of a different component.
        setTimeout(() => {
            // TODO: batch update ? aggregating multiple inform request to one callback is possible
            for (const cb of this.callback) cb()
        })
    }
}
class EmotionInformativeSheetsRegistry {
    reg = new Informative()
    constructor(public cache: EmotionCache) {
        const orig = cache.sheet.insert
        cache.sheet.insert = (...args) => {
            const r = orig.call(cache.sheet, ...args)
            this.reg.inform()
            return r
        }
    }
    toString() {
        return this.cache.sheet.tags.map((x) => x.innerHTML).join('\n')
    }
}
// ! let jss tell us if it has made an update
class JSSInformativeSheetsRegistry extends JSSSheetsRegistry {
    reg = new Informative()
    add(...args: Parameters<JSSSheetsRegistry['add']>) {
        super.add(...args)
        this.reg.inform()
    }
    reset(...args: Parameters<JSSSheetsRegistry['reset']>) {
        super.reset(...args)
        this.reg.inform()
    }
    remove(...args: Parameters<JSSSheetsRegistry['remove']>) {
        super.remove(...args)
        this.reg.inform()
    }
}

const jssRegistryMap = new WeakMap<ShadowRoot, JSSInformativeSheetsRegistry>()
const emotionRegistryMap = new WeakMap<ShadowRoot, EmotionInformativeSheetsRegistry>()
export function useSheetsRegistryStyles(_current: Node | null) {
    const jssSubscription = useMemo(() => {
        let registry: JSSInformativeSheetsRegistry | null | undefined = null
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
            subscribe: (callback: () => void) => registry?.reg.addListener(callback) ?? (() => 0),
        }
    }, [_current])
    const emotionSubscription = useMemo(() => {
        let registry: EmotionInformativeSheetsRegistry | null | undefined = null
        if (_current) {
            // ! lookup the styled shadowroot
            const current: Node = _current.getRootNode()
            if (current) {
                const shadowroot = current as ShadowRoot | undefined
                registry = shadowroot === portalShadowRoot ? null : emotionRegistryMap.get(shadowroot as ShadowRoot)
            }
        }
        return {
            getCurrentValue: () => registry?.toString(),
            subscribe: (callback: () => void) => registry?.reg.addListener(callback) ?? (() => 0),
        }
    }, [_current])
    return useSubscription(jssSubscription) + '\n' + useSubscription(emotionSubscription)
}
const initOnceMap = new WeakMap<ShadowRoot, unknown>()
function initOnce<T>(keyBy: ShadowRoot, init: () => T): T {
    if (initOnceMap.has(keyBy)) return initOnceMap.get(keyBy) as T
    const val = init()
    initOnceMap.set(keyBy, val)
    return val
}
function ShadowRootStyleProvider({ shadow, ...props }: React.PropsWithChildren<{ shadow: ShadowRoot }>) {
    const { jss, JSSRegistry, JSSSheetsManager, emotionCache } = initOnce(shadow, () => {
        const head = shadow.appendChild(document.createElement('head'))
        const JSSInsertionPoint = head.appendChild(document.createElement('div'))
        const EmotionInsertionPoint = head.appendChild(document.createElement('div'))
        // JSS
        const jss = createJSS({
            ...jssPreset(),
            insertionPoint: JSSInsertionPoint,
        })
        const JSSRegistry = new JSSInformativeSheetsRegistry()
        const JSSSheetsManager = new WeakMap()
        jssRegistryMap.set(shadow, JSSRegistry)
        // Emotion
        const emotionCache = createEmotionCache({
            container: EmotionInsertionPoint,
            // emotion doesn't allow numbers appears in the key
            key: 'emo-' + Math.random().toString(36).slice(2).replace(/[0-9]/g, 'x'),
            speedy: false,
            // TODO: support speedy mode which use insertRule https://github.com/emotion-js/emotion/blob/master/packages/sheet/src/index.js
        })
        emotionRegistryMap.set(shadow, new EmotionInformativeSheetsRegistry(emotionCache))
        return { jss, JSSRegistry, JSSSheetsManager, emotionCache }
    })
    return (
        // ! sheetsManager: Material-ui uses this to detect if the style has been rendered
        // ! sheetsRegistry: We use this to get styles as a whole string
        <EmotionCacheProvider value={emotionCache}>
            <JSSStylesProvider
                sheetsRegistry={JSSRegistry}
                jss={jss}
                sheetsManager={JSSSheetsManager}
                children={props.children}
            />
        </EmotionCacheProvider>
    )
}

type MaskbookProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>

function Maskbook(_props: MaskbookProps) {
    return (
        <ThemeProvider theme={getActivatedUI().useTheme()}>
            <I18nextProvider i18n={i18nNextInstance}>
                <SnackbarProvider maxSnack={30} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <StrictMode>
                        <span {..._props} />
                    </StrictMode>
                </SnackbarProvider>
            </I18nextProvider>
        </ThemeProvider>
    )
}
