import type { FC, PropsWithChildren } from 'react'
import { BaseSharedUIProvider } from './base'
import { EvmSharedUIProvider } from './evm'

export const SharedContextProvider: FC<PropsWithChildren<{}>> = ({ children }) => (
    <BaseSharedUIProvider>
        <EvmSharedUIProvider>{children}</EvmSharedUIProvider>
    </BaseSharedUIProvider>
)
