import type { PropsWithChildren } from 'react'
import { ConfirmProvider } from './Confirm/index.js'
import { SelectFungibleTokenProvider } from './SelectFungibleTokenDialog/index.js'
import { SelectGasSettingsProvider } from './SelectAdvancedSettingsDialog/index.js'
import { SelectNonFungibleContractProvider } from './SelectNonFungibleContractDialog/index.js'

export * from './Confirm/index.js'
export * from './SelectFungibleTokenDialog/index.js'
export * from './SelectNonFungibleContractDialog/index.js'
export * from './SelectAdvancedSettingsDialog/index.js'

export function CommonUIProvider({ children }: PropsWithChildren<{}>) {
    return (
        <ConfirmProvider>
            <SelectFungibleTokenProvider>
                <SelectNonFungibleContractProvider>
                    <SelectGasSettingsProvider>{children}</SelectGasSettingsProvider>
                </SelectNonFungibleContractProvider>
            </SelectFungibleTokenProvider>
        </ConfirmProvider>
    )
}
