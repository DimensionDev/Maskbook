import { create as createJSS, SheetsRegistry as JSSSheetsRegistry } from 'jss'
import {
    jssPreset,
    StylesProvider as JSSStylesProvider,
    ThemeProvider,
    createGenerateClassName,
} from '@material-ui/core/styles'
import { CacheProvider as EmotionCacheProvider } from '@emotion/react'
import createEmotionCache, { EmotionCache } from '@emotion/cache'
import ReactDOM from 'react-dom'
import { useMemo, useRef } from 'react'
import type {} from 'react/experimental'
import type {} from 'react-dom/experimental'
import { activatedSocialNetworkUI } from '../../social-network'
import { portalShadowRoot } from './ShadowRootPortal'
import { useSubscription } from 'use-subscription'
import { ErrorBoundary } from '../../components/shared/ErrorBoundary'
import { MaskbookUIRoot } from '../../UIRoot'
import { applyMaskColorVars } from '@dimensiondev/maskbook-theme'
import { appearanceSettings } from '../../settings/settings'
import { getMaskbookTheme } from '../theme'

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
        signal?: AbortSignal
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
    config.signal?.addEventListener('abort', () => unmount())
    return (): void => void (rendered && unmount())
}

const seen = new WeakMap<HTMLElement, ReactDOM.Root>()
function mount(host: ShadowRoot, _: JSX.Element, keyBy = 'app', concurrent?: boolean) {
    const container = getContainer()
    if (container.childElementCount && process.env.NODE_ENV === 'development') {
        console.warn(
            `The node you want to mount on`,
            container,
            `already has children in it. It is highly like a mistake. Did you forget to set "keyBy" correctly?`,
        )
    }
    for (const each of captureEvents) {
        host.addEventListener(each, (e) => e.stopPropagation())
    }
    if (concurrent) {
        const root = seen.get(container) || ReactDOM.unstable_createRoot(container)
        seen.set(container, root)
        root.render(_)
        return () => root.unmount()
    } else {
        ReactDOM.render(_, container)
        return () => ReactDOM.unmountComponentAtNode(container)
    }

    function getContainer() {
        const root = host.querySelector<HTMLElement>(`main.${keyBy}`)
        if (root) return root
        const dom = host.appendChild(document.createElement('main'))
        dom.className = keyBy
        return dom
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
    private pendingInform = false
    inform() {
        if (this.pendingInform) return
        requestAnimationFrame(() => {
            this.pendingInform = false
            this.callback.forEach((x) => x())
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
    return [useSubscription(emotionSubscription), useSubscription(jssSubscription)].filter(Boolean).join('\n')
}
const initOnceMap = new WeakMap<ShadowRoot, unknown>()
function initOnce<T>(keyBy: ShadowRoot, init: () => T): T {
    if (initOnceMap.has(keyBy)) return initOnceMap.get(keyBy) as T
    const val = init()
    initOnceMap.set(keyBy, val)
    return val
}
function createElement(key: keyof HTMLElementTagNameMap, kind: string) {
    const e = document.createElement(key)
    e.setAttribute('data-' + kind, 'true')
    return e
}
function ShadowRootStyleProvider({ shadow, ...props }: React.PropsWithChildren<{ shadow: ShadowRoot }>) {
    const { jss, JSSRegistry, JSSSheetsManager, emotionCache, generateClassName } = initOnce(shadow, () => {
        const head = shadow.appendChild(createElement('head', 'css-container'))
        const themeCSSVars = head.appendChild(document.createElement('style'))
        function updateThemeVars() {
            applyMaskColorVars(themeCSSVars, getMaskbookTheme().palette.mode)
        }
        updateThemeVars()
        appearanceSettings.addListener(updateThemeVars)
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeVars)
        const EmotionInsertionPoint = head.appendChild(createElement('div', 'emotion-area'))
        const JSSInsertionContainer = head.appendChild(createElement('div', 'jss-area'))
        const JSSInsertionPoint = JSSInsertionContainer.appendChild(createElement('div', 'jss-insert-point'))
        // emotion doesn't allow numbers appears in the key
        const instanceID = Math.random().toString(36).slice(2).replace(/[0-9]/g, 'x')
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
            key: 'emo-' + instanceID,
            speedy: false,
            // TODO: support speedy mode which use insertRule https://github.com/emotion-js/emotion/blob/master/packages/sheet/src/index.js
        })
        emotionRegistryMap.set(shadow, new EmotionInformativeSheetsRegistry(emotionCache))
        const generateClassName = createGenerateClassName({ seed: instanceID })
        return { jss, JSSRegistry, JSSSheetsManager, emotionCache, generateClassName }
    })
    return (
        // ! sheetsManager: Material-ui uses this to detect if the style has been rendered
        // ! sheetsRegistry: We use this to get styles as a whole string
        <EmotionCacheProvider value={emotionCache}>
            <JSSStylesProvider
                generateClassName={generateClassName}
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
    const useTheme = useRef(activatedSocialNetworkUI.customization.useTheme).current
    const theme = useTheme?.() || getMaskbookTheme()
    return MaskbookUIRoot(
        <ThemeProvider theme={theme}>
            <span {..._props} />
        </ThemeProvider>,
    )
}
