import { createContext } from 'react'
export const DebugElementProvider = createContext<boolean>(
    (() => {
        try {
            return process.env.NODE_ENV === 'development'
        } catch {}
        return false
    })(),
)
DebugElementProvider.displayName = 'DebugElementProvider'
