import type { FC, PropsWithChildren } from 'react'
import { ConfirmProvider } from './Confirm'
import { SelectFungibleTokenProvider } from './SelectFungibleTokenDialog'
import { SelectGasSettingsProvider } from './SelectGasSettingsDialog'

export * from './Confirm'
export * from './SelectFungibleTokenDialog'
export * from './SelectGasSettingsDialog'

export const CommonUIProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
    return (
        <ConfirmProvider>
            <SelectFungibleTokenProvider>
                <SelectGasSettingsProvider>{children}</SelectGasSettingsProvider>
            </SelectFungibleTokenProvider>
        </ConfirmProvider>
    )
}
