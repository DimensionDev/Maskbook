import { createContext, useContext } from 'react'

export const HasNavigatorContext = createContext(false)
export function useHasNavigator() {
    return useContext(HasNavigatorContext)
}
