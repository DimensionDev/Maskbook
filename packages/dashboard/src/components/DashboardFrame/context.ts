import { createContext } from 'react'

export interface NavigationState {
    expanded: boolean
    setExpanded?: (e: boolean) => void
}
export const NavigationContextDefault = {
    expanded: true,
}

export const NavigationContext = createContext<NavigationState>(NavigationContextDefault)
