import type { FC } from 'react'
import { BaseSharedUIProvider } from './base'
import { EvmSharedUIProvider } from './evm'

export const SharedContextProvider: FC = ({ children }) => {
    return (
        <BaseSharedUIProvider>
            <EvmSharedUIProvider>{children}</EvmSharedUIProvider>
        </BaseSharedUIProvider>
    )
}
