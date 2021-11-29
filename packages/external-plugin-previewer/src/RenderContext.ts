import { createContext } from 'react'

export interface RenderContext {
    permissionAwareOpen(url: string): void
    baseURL: string
}
export const RenderContext = createContext<RenderContext>(null!)
