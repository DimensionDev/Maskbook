import type { FC } from 'react'
import { BaseUIRuntimeProvider } from './base'
import { EvmUIRuntimeProvider } from './evm'

export const UIRuntimeProvider: FC = ({ children }) => {
    return (
        <BaseUIRuntimeProvider>
            <EvmUIRuntimeProvider>{children}</EvmUIRuntimeProvider>
        </BaseUIRuntimeProvider>
    )
}
