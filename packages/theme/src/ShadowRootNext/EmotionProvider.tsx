import { createContext, useContext } from 'react'
import createEmotionCache, { type EmotionCache } from '@emotion/cache'

/** @internal */
export const useEmotionProvider: (option: useEmotionProviderOptions) => useEmotionProviderReturns =
    typeof document === 'object' && 'ado' in document
        ? useEmotionProvider_ConstructableStyleSheet
        : useEmotionProvider_Clone

/** @internal */
export const SyncStyleSheetToShadowRootContext = createContext<(ref: Node | null) => () => void>(() => {
    throw new Error('No ShadowRootIsolationProvider is provided.')
})

/**
 * Start to sync StyleSheet on a Node with the current scope. Return a function to stop syncing.
 */
export function useSyncStyleSheetToShadowRoot(): (ref: Node | null) => () => void {
    return useContext(SyncStyleSheetToShadowRootContext)
}

/** @internal */
export interface useEmotionProviderOptions {}
/** @internal */
export interface useEmotionProviderReturns {
    muiEmotionCache: EmotionCache
    tssEmotionCache: EmotionCache
}

// #region Clone style
function useEmotionProvider_Clone(option: useEmotionProviderOptions): useEmotionProviderReturns {
    const muiEmotionCache = createEmotionCache({ key: 'mui' })
    muiEmotionCache
    return {
        muiEmotionCache,
        tssEmotionCache: createEmotionCache({ key: 'tss' }),
    }
}
// #endregion

// #region Share style
function useEmotionProvider_ConstructableStyleSheet(option: useEmotionProviderOptions): useEmotionProviderReturns {
    return {
        muiEmotionCache: createEmotionCache({ key: 'mui' }),
        tssEmotionCache: createEmotionCache({ key: 'tss' }),
    }
}
