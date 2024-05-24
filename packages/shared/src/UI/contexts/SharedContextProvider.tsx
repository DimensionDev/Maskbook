import type { PropsWithChildren } from 'react'
import { BaseSharedUIProvider } from './base/index.js'

export function SharedContextProvider({ children }: PropsWithChildren) {
    return <BaseSharedUIProvider>{children}</BaseSharedUIProvider>
}
