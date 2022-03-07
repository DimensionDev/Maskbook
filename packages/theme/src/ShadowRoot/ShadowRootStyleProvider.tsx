import { useRef } from 'react'
import createEmotionCache, { type EmotionCache } from '@emotion/cache'
import { CacheProvider as EmotionCacheProvider } from '@emotion/react'
import { TssCacheProvider } from 'tss-react'
import { StyleSheet } from './ShadowRootStyleSheet'
import { StyleSheetsContext } from './Contexts'

/** @internal */
export interface ShadowRootStyleProviderProps extends React.PropsWithChildren<{}> {
    shadow: ShadowRoot
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
    const [mui, tss, sheets] = useShadowRootEmotionCache(shadow)
    return (
        <StyleSheetsContext.Provider value={sheets}>
            <EmotionCacheProvider value={mui}>
                <TssCacheProvider value={tss}>{children}</TssCacheProvider>
            </EmotionCacheProvider>
        </StyleSheetsContext.Provider>
    )
}

function useShadowRootEmotionCache(shadow: ShadowRoot) {
    const ref = useRef<readonly [EmotionCache, EmotionCache, [StyleSheet, StyleSheet]]>()

    if (!ref.current) {
        // emotion doesn't allow numbers appears in the key
        const instanceID = Math.random().toString(36).slice(2).replace(/\d/g, 'x')
        const keyA = 'mui-' + instanceID
        const keyB = 'tss-' + instanceID

        const muiEmotionCache = createEmotionCache({ key: keyA })
        const muiStyleSheet = new StyleSheet(keyA, shadow)
        muiEmotionCache.sheet = muiStyleSheet

        const tssEmotionCache = createEmotionCache({ key: keyB })
        const tssStyleSheet = new StyleSheet(keyB, shadow)
        tssEmotionCache.sheet = tssStyleSheet

        ref.current = [muiEmotionCache, tssEmotionCache, [muiStyleSheet, tssStyleSheet]]
    }

    return ref.current
}
