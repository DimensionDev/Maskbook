import { CacheProvider as EmotionCacheProvider } from '@emotion/react'
import createEmotionCache from '@emotion/cache'
import { TssCacheProvider } from 'tss-react'
import { StyleSheet } from '../ShadowRootNext/ShadowRootStyleSheet'
import { useContext, createContext } from 'react'

const SheetContext = createContext<readonly [StyleSheet, StyleSheet]>(null!)
/**
 * Return all CSS created by the emotion instance in the current ShadowRoot.
 *
 * This is used to keep the CSS correct when the rendering is crossing multiple ShadowRoot (e.g. a Modal, Dialog or other things need rendered by React Portal)
 *
 * @param ref DOM reference
 * @returns CSS string
 */
export function useAddSyncToStyleSheet(ref: Node | null) {
    const [emotion, tss] = useContext(SheetContext)
    if (!ref) return
    const shadow = ref.getRootNode() as ShadowRoot
    if (!shadow) return
    const head = shadow.querySelector('head') || shadow.appendChild(document.createElement('head'))
    const muiInsertionPoint = head.querySelector('[data-mui]') || head.appendChild(createElement('div', 'mui'))
    const tssInsertionPoint = head.querySelector('[data-tss]') || head.appendChild(createElement('div', 'tss'))
    emotion.addContainer(muiInsertionPoint)
    tss.addContainer(tssInsertionPoint)
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
    const { muiEmotionCache, tssEmotionCache, sheets } = initOnce(shadow, () => init(props))
    return (
        <SheetContext.Provider value={sheets}>
            <EmotionCacheProvider value={muiEmotionCache}>
                <TssCacheProvider value={tssEmotionCache}>{children}</TssCacheProvider>
            </EmotionCacheProvider>
        </SheetContext.Provider>
    )
}
function init({ shadow }: ShadowRootStyleProviderProps) {
    const head = shadow.appendChild(createElement('head', 'css-container'))

    // #region Emotion
    const MuiInsertionPoint = head.appendChild(createElement('div', 'mui-area'))
    const TSSInsertionPoint = head.appendChild(createElement('div', 'tss-area'))
    // emotion doesn't allow numbers appears in the key
    const instanceID = Math.random().toString(36).slice(2).replace(/\d/g, 'x')

    const muiEmotionCache = createEmotionCache({ key: 'x' })
    const muiStyleSheet = new StyleSheet({ key: 'mui-' + instanceID })
    muiStyleSheet.addContainer(MuiInsertionPoint)
    muiEmotionCache.sheet = muiStyleSheet

    const tssEmotionCache = createEmotionCache({ key: 'x' })
    const tssStyleSheet = new StyleSheet({ key: 'tss-' + instanceID })
    tssStyleSheet.addContainer(TSSInsertionPoint)
    tssEmotionCache.sheet = tssStyleSheet
    // #endregion
    return { muiEmotionCache, tssEmotionCache, sheets: [muiStyleSheet, tssStyleSheet] as const }
}
