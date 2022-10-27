import { useContext, createContext } from 'react'

export interface CompositionContext {
    attachMetadata(metaID: string, value: unknown): void
    dropMetadata(metaID: string): void
}
export const CompositionContext = createContext<CompositionContext>({
    attachMetadata() {},
    dropMetadata() {},
})
CompositionContext.displayName = 'CompositionContext'
export const useCompositionContext = () => useContext(CompositionContext)
import.meta.webpackHot && import.meta.webpackHot.accept()
