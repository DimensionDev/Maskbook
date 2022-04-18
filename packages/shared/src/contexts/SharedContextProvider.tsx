import type { FC, PropsWithChildren } from 'react'
import { BaseSharedUIProvider } from './base'
import { CommonUIProvider } from './common'
import { EvmSharedUIProvider } from './evm'

export const SharedContextProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <BaseSharedUIProvider>
            <CommonUIProvider>
                <EvmSharedUIProvider>{children}</EvmSharedUIProvider>
            </CommonUIProvider>
        </BaseSharedUIProvider>
    )
}
