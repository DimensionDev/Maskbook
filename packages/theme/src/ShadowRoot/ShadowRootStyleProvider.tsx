import { CacheProvider as EmotionCacheProvider } from '@emotion/react'
import createEmotionCache, { EmotionCache } from '@emotion/cache'
import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { TssCacheProvider } from 'tss-react'

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

const emotionRegistryMap = new WeakMap<ShadowRoot, EmotionInformativeSheetsRegistry>()
const emotion2RegistryMap = new WeakMap<ShadowRoot, EmotionInformativeSheetsRegistry>()
function createSubscription(registry: undefined | EmotionInformativeSheetsRegistry) {
    return {
        getCurrentValue: () => registry?.toString(),
        subscribe: (callback: () => void) => registry?.reg.addListener(callback) ?? (() => 0),
    }
}

/**
 * Return all CSS created by the emotion instance in the current ShadowRoot.
 *
 * This is used to keep the CSS correct when the rendering is crossing multiple ShadowRoot (e.g. a Modal, Dialog or other things need rendered by React Portal)
 *
 * @param ref DOM reference
 * @returns CSS string
 */
export function useCurrentShadowRootStyles(ref: Node | null): string {
    const emotionSubscription = useMemo(() => {
        const root = ref?.getRootNode() as ShadowRoot
        const registry = emotionRegistryMap.get(root)
        return createSubscription(registry)
    }, [ref])
    const emotion2Subscription = useMemo(() => {
        const root = ref?.getRootNode() as ShadowRoot
        const registry = emotion2RegistryMap.get(root)
        return createSubscription(registry)
    }, [ref])
    return [useSubscription(emotionSubscription), useSubscription(emotion2Subscription)].filter(Boolean).join('\n')
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
}
/** @internal */
export function ShadowRootStyleProvider(props: ShadowRootStyleProviderProps) {
    const { shadow, children } = props
    const { muiEmotionCache, tssEmotionCache } = initOnce(shadow, () => init(props))
    return (
        <EmotionCacheProvider value={muiEmotionCache}>
            <TssCacheProvider value={tssEmotionCache}>{children}</TssCacheProvider>
        </EmotionCacheProvider>
    )
}
function init({ shadow }: ShadowRootStyleProviderProps) {
    const head = shadow.appendChild(createElement('head', 'css-container'))

    // #region Emotion
    const MuiInsertionPoint = head.appendChild(createElement('div', 'mui-area'))
    const TSSInsertionPoint = head.appendChild(createElement('div', 'tss-area'))
    // emotion doesn't allow numbers appears in the key
    const instanceID = Math.random().toString(36).slice(2).replace(/\d/g, 'x')
    const muiEmotionCache = createEmotionCache({
        container: MuiInsertionPoint,
        key: 'mui-' + instanceID,
        speedy: false,
        // TODO: support speedy mode which use insertRule
        // https://github.com/emotion-js/emotion/blob/master/packages/sheet/src/index.js
    })
    const tssEmotionCache = createEmotionCache({
        container: TSSInsertionPoint,
        key: 'tss-' + instanceID,
        speedy: false,
    })
    emotionRegistryMap.set(shadow, new EmotionInformativeSheetsRegistry(muiEmotionCache))
    emotion2RegistryMap.set(shadow, new EmotionInformativeSheetsRegistry(tssEmotionCache))
    // #endregion
    return { muiEmotionCache, tssEmotionCache }
}
