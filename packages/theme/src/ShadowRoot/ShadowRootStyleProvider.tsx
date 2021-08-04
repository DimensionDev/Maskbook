import { create as createJSS, SheetsRegistry as JSSSheetsRegistry } from 'jss'
import { jssPreset, StylesProvider as JSSStylesProvider, createGenerateClassName } from '@material-ui/styles'
import { CacheProvider as EmotionCacheProvider } from '@emotion/react'
import createEmotionCache, { EmotionCache } from '@emotion/cache'
import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'

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
function createSubscription(registry: undefined | JSSInformativeSheetsRegistry | EmotionInformativeSheetsRegistry) {
    return {
        getCurrentValue: () => registry?.toString(),
        subscribe: (callback: () => void) => registry?.reg.addListener(callback) ?? (() => 0),
    }
}

/**
 * Return all CSS created by the JSS and emotion instance in the current ShadowRoot.
 *
 * This is used to keep the CSS correct when the rendering is crossing multiple ShadowRoot (e.g. a Modal, Dialog or other things need rendered by React Portal)
 *
 * @param ref DOM reference
 * @returns CSS string
 */
export function useCurrentShadowRootStyles(ref: Node | null): string {
    const jssSubscription = useMemo(() => {
        const root = ref?.getRootNode() as ShadowRoot
        const registry = jssRegistryMap.get(root)
        return createSubscription(registry)
    }, [ref])
    const emotionSubscription = useMemo(() => {
        const root = ref?.getRootNode() as ShadowRoot
        const registry = emotionRegistryMap.get(root)
        return createSubscription(registry)
    }, [ref])
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
/** @internal */
export interface ShadowRootStyleProviderProps extends React.PropsWithChildren<{}> {
    shadow: ShadowRoot
    onHeadCreate?(head: HTMLHeadElement): void
}
/** @internal */
export function ShadowRootStyleProvider(props: ShadowRootStyleProviderProps) {
    const { shadow, children } = props
    const { jss, JSSRegistry, JSSSheetsManager, emotionCache, generateClassName } = initOnce(shadow, () => init(props))
    return (
        <EmotionCacheProvider value={emotionCache}>
            <JSSStylesProvider
                generateClassName={generateClassName}
                jss={jss}
                // ? sheetsRegistry: Use this to get styles as a whole string
                sheetsRegistry={JSSRegistry}
                // ? sheetsManager: Material-ui uses this to detect if the style has been rendered
                sheetsManager={JSSSheetsManager}
                children={children}
            />
        </EmotionCacheProvider>
    )
}
function init({ shadow, onHeadCreate }: ShadowRootStyleProviderProps) {
    const head = shadow.appendChild(createElement('head', 'css-container'))

    onHeadCreate?.(head)
    //#region Emotion
    const EmotionInsertionPoint = head.appendChild(createElement('div', 'emotion-area'))
    // emotion doesn't allow numbers appears in the key
    const instanceID = Math.random().toString(36).slice(2).replace(/[0-9]/g, 'x')
    const emotionCache = createEmotionCache({
        container: EmotionInsertionPoint,
        key: 'emo-' + instanceID,
        speedy: false,
        // TODO: support speedy mode which use insertRule
        // https://github.com/emotion-js/emotion/blob/master/packages/sheet/src/index.js
    })
    emotionRegistryMap.set(shadow, new EmotionInformativeSheetsRegistry(emotionCache))
    //#endregion
    //#region JSS
    const JSSInsertionContainer = head.appendChild(createElement('div', 'jss-area'))
    const JSSInsertionPoint = JSSInsertionContainer.appendChild(createElement('div', 'jss-insert-point'))
    const jss = createJSS({
        ...jssPreset(),
        insertionPoint: JSSInsertionPoint,
    })
    const JSSRegistry = new JSSInformativeSheetsRegistry()
    const JSSSheetsManager = new WeakMap()
    jssRegistryMap.set(shadow, JSSRegistry)
    //#endregion
    const generateClassName = createGenerateClassName({ seed: instanceID })
    return { jss, JSSRegistry, JSSSheetsManager, emotionCache, generateClassName }
}

// Note: By disabling usage of .cssRules which does not exists when the DOM is unattached
// we can get rid of the race condition.
// See https://github.com/DimensionDev/Maskbook/issues/2834 for details
function patchJSSDomRenderer() {
    const jss: any = createJSS()
    const methods = jss.options.Renderer.prototype
    methods.deploy = function () {
        const { sheet } = this
        this.element.textContent = `\n${sheet.toString()}\n`
    }
}
try {
    patchJSSDomRenderer()
} catch {}
