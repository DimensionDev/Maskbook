import createEmotionCache, { type EmotionCache } from '@emotion/cache'
import { CacheProvider as EmotionCacheProvider } from '@emotion/react'
import { TssCacheProvider } from 'tss-react'
import { StyleSheet } from './ShadowRootStyleSheet.js'
import { PreventShadowRootEventPropagationListContext, stopPropagation, StyleSheetsContext } from './Contexts.js'
import { useContext, useEffect } from 'react'

/** @internal */
export interface ShadowRootStyleProviderProps extends React.PropsWithChildren<{}> {
    shadow: ShadowRoot
    preventPropagation: boolean
}
/**
 * @internal
 * This component provide the modified version of tss-react and emotion context,
 * therefore styles within this component can render correctly in ShadowRoot.
 *
 * This component is used to render inside a bare ShadowRoot.
 * If you need a nested ShadowRoot render, use ShadowRootIsolation.
 */
export function ShadowRootStyleProvider(props: ShadowRootStyleProviderProps) {
    const { shadow, children } = props
    const [mui, tss, sheets] = getShadowRootEmotionCache(shadow)

    const preventEventPropagationList = useContext(PreventShadowRootEventPropagationListContext)
    useEffect(() => {
        if (!props.preventPropagation) return
        preventEventPropagationList.forEach((event) => shadow.addEventListener(event, stopPropagation))
        return () => preventEventPropagationList.forEach((event) => shadow.removeEventListener(event, stopPropagation))
    }, [props.preventPropagation, preventEventPropagationList, shadow])

    return (
        <StyleSheetsContext.Provider value={sheets}>
            <EmotionCacheProvider value={mui}>
                <TssCacheProvider value={tss}>{children}</TssCacheProvider>
            </EmotionCacheProvider>
        </StyleSheetsContext.Provider>
    )
}

const styleSheetMap = new WeakMap<ShadowRoot, [EmotionCache, EmotionCache, [StyleSheet, StyleSheet]]>()

function getShadowRootEmotionCache(shadow: ShadowRoot) {
    if (styleSheetMap.has(shadow)) return styleSheetMap.get(shadow)!

    // emotion doesn't allow numbers appears in the key
    const instanceID = Math.random().toString(36).slice(2).replace(/\d/g, 'x').slice(0, 4)
    const keyA = 'mui-' + instanceID
    const keyB = 'tss-' + instanceID

    // https://github.com/emotion-js/emotion/issues/2933
    const muiEmotionCache = (createEmotionCache.default || createEmotionCache)({ key: keyA })
    const muiStyleSheet = new StyleSheet({ key: keyA, container: shadow })
    muiEmotionCache.sheet = muiStyleSheet

    const tssEmotionCache = (createEmotionCache.default || createEmotionCache)({ key: keyB })
    const tssStyleSheet = new StyleSheet({ key: keyB, container: shadow })
    tssEmotionCache.sheet = tssStyleSheet

    styleSheetMap.set(shadow, [muiEmotionCache, tssEmotionCache, [muiStyleSheet, tssStyleSheet]])
    return styleSheetMap.get(shadow)!
}
