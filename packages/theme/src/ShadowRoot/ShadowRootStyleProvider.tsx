import { useContext, useEffect } from 'react'
import createEmotionCache, { type EmotionCache } from '@emotion/cache'
import { CacheProvider as EmotionCacheProvider } from '@emotion/react'
import { StyleSheet } from './ShadowRootStyleSheet.js'
import { PreventShadowRootEventPropagationListContext, stopPropagation, StyleSheetsContext } from './Contexts.js'

interface ShadowRootStyleProviderProps extends React.PropsWithChildren {
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
    const [cache, sheets] = getShadowRootEmotionCache(shadow)

    const preventEventPropagationList = useContext(PreventShadowRootEventPropagationListContext)
    useEffect(() => {
        if (!props.preventPropagation) return
        const ac = new AbortController()
        const signal = ac.signal
        preventEventPropagationList.forEach((event) => shadow.addEventListener(event, stopPropagation, { signal }))
        return () => ac.abort()
    }, [props.preventPropagation, preventEventPropagationList, shadow])

    return (
        <StyleSheetsContext value={sheets}>
            <EmotionCacheProvider value={cache}>{children}</EmotionCacheProvider>
        </StyleSheetsContext>
    )
}

const styleSheetMap = new WeakMap<ShadowRoot, [EmotionCache, StyleSheet]>()

function getShadowRootEmotionCache(shadow: ShadowRoot) {
    if (styleSheetMap.has(shadow)) return styleSheetMap.get(shadow)!

    // emotion doesn't allow numbers appears in the key
    const instanceID = Math.random().toString(36).slice(2).replaceAll(/\d/g, 'x').slice(0, 4)
    const key = 'css-' + instanceID

    const muiEmotionCache = createEmotionCache({ key })
    const muiStyleSheet = new StyleSheet({ key, container: shadow })
    muiEmotionCache.sheet = muiStyleSheet

    styleSheetMap.set(shadow, [muiEmotionCache, muiStyleSheet])
    return styleSheetMap.get(shadow)!
}
