import type { FC, PropsWithChildren } from 'react'
import { ConfirmProvider } from './Confirm/index.js'
import { SelectFungibleTokenProvider } from './SelectFungibleTokenDialog/index.js'
import { SelectGasSettingsProvider } from './SelectAdvancedSettingsDialog/index.js'

export * from './Confirm/index.js'
export * from './SelectFungibleTokenDialog/index.js'
export * from './SelectAdvancedSettingsDialog/index.js'

export const CommonUIProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <ConfirmProvider>
            <SelectFungibleTokenProvider>
                <SelectGasSettingsProvider>{children}</SelectGasSettingsProvider>
            </SelectFungibleTokenProvider>
        </ConfirmProvider>
    )
}
