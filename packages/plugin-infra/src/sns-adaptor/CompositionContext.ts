import { useContext, createContext } from 'react'

export type CompositionType = 'popup' | 'timeline'

export interface CompositionContext {
    type: CompositionType
    getMetadata(): ReadonlyMap<string, unknown> | undefined
    attachMetadata(metaID: string, value: unknown): void
    dropMetadata(metaID: string): void
}
export const CompositionContext = createContext<CompositionContext>({
    type: 'popup',
    getMetadata: () => undefined,
    attachMetadata() {},
    dropMetadata() {},
})
CompositionContext.displayName = 'CompositionContext'
export const useCompositionContext = () => useContext(CompositionContext)
import.meta.webpackHot?.accept()
