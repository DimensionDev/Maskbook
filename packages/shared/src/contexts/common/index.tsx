import type { PropsWithChildren } from 'react'
import { ConfirmProvider } from './Confirm/index.js'
import { SelectFungibleTokenProvider } from './SelectFungibleTokenDialog/index.js'
import { SelectGasSettingsProvider } from './SelectAdvancedSettingsDialog/index.js'
import { SelectNonFungibleContractProvider } from './SelectNonFungibleContractDialog/index.js'
import { AddCollectiblesProvider } from './AddCollectiblesDialog/index.js'

export * from './Confirm/index.js'
export * from './SelectFungibleTokenDialog/index.js'
export * from './SelectNonFungibleContractDialog/index.js'
export * from './SelectAdvancedSettingsDialog/index.js'
export * from './AddCollectiblesDialog/index.js'

export function CommonUIProvider({ children }: PropsWithChildren<{}>) {
    return (
        <ConfirmProvider>
            <SelectFungibleTokenProvider>
                <AddCollectiblesProvider>
                    <SelectNonFungibleContractProvider>
                        <SelectGasSettingsProvider>{children}</SelectGasSettingsProvider>
                    </SelectNonFungibleContractProvider>
                </AddCollectiblesProvider>
            </SelectFungibleTokenProvider>
        </ConfirmProvider>
    )
}
