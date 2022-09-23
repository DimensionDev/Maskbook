import { createContext } from 'react'

export const CollectibleListContext = createContext<{
    collectiblesRetry: () => void
}>(null!)
