import { useContext, createContext } from 'react'

export type CompositionType = 'popup' | 'timeline'

export interface CompositionContext {
    type: CompositionType
    attachMetadata(metaID: string, value: unknown): void
    dropMetadata(metaID: string): void
}
export const CompositionContext = createContext<CompositionContext>({
    type: 'popup',
    attachMetadata() {},
    dropMetadata() {},
})
CompositionContext.displayName = 'CompositionContext'
export const useCompositionContext = () => useContext(CompositionContext)
import.meta.webpackHot && import.meta.webpackHot.accept()
