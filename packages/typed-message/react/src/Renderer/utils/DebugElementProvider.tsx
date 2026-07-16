import { createContext } from 'react'

let dev
try {
    dev = process.env.NODE_ENV === 'development'
} catch {
    dev = false
}
export const DebugElementProviderContext = createContext<boolean>(dev)
DebugElementProviderContext.displayName = 'DebugElementProvider'
