import type { PropsWithChildren } from 'react'
import { TradeProvider } from './TradeProvider.js'
import { GasManager } from './GasManager.js'

export function Providers({ children }: PropsWithChildren) {
    return (
        <TradeProvider>
            <GasManager>{children}</GasManager>
        </TradeProvider>
    )
}

export * from './TradeProvider.js'
export * from './GasManager.js'
export * from './RuntimeProvider.js'
