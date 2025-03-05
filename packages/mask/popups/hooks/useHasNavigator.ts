import { createContext, useContext } from 'react'

export const HasNavigatorContext = createContext(false)
HasNavigatorContext.displayName = 'HasNavigatorContext'
export function useHasNavigator() {
    return useContext(HasNavigatorContext)
}
