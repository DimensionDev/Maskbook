import type { PropsWithChildren } from 'react'
import { SwapProvider } from './SwapProvider.js'
import { GasManager } from './GasManager.js'

export function Providers({ children }: PropsWithChildren) {
    return (
        <SwapProvider>
            <GasManager>{children}</GasManager>
        </SwapProvider>
    )
}

export * from './SwapProvider.js'
export * from './GasManager.js'
