import type { FC, PropsWithChildren } from 'react'
import { ConfirmProvider } from './Confirm'
import { SelectFungibleTokenProvider } from './SelectFungibleTokenDialog'
import { SelectGasSettingsProvider } from './SelectAdvancedSettingsDialog'

export * from './Confirm'
export * from './SelectFungibleTokenDialog'
export * from './SelectAdvancedSettingsDialog'

export const CommonUIProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <ConfirmProvider>
            <SelectFungibleTokenProvider>
                <SelectGasSettingsProvider>{children}</SelectGasSettingsProvider>
            </SelectFungibleTokenProvider>
        </ConfirmProvider>
    )
}
