import type { PropsWithChildren } from 'react'
import { SelectFungibleTokenProvider } from './SelectFungibleTokenDialog/index.js'
import { SelectGasSettingsProvider } from './SelectAdvancedSettingsDialog/index.js'
import { AddCollectiblesProvider } from './AddCollectiblesDialog/index.js'

export * from './SelectFungibleTokenDialog/index.js'
export * from './SelectAdvancedSettingsDialog/index.js'
export * from './AddCollectiblesDialog/index.js'

export function CommonUIProvider({ children }: PropsWithChildren<{}>) {
    return (
        <SelectFungibleTokenProvider>
            <AddCollectiblesProvider>
                <SelectGasSettingsProvider>{children}</SelectGasSettingsProvider>
            </AddCollectiblesProvider>
        </SelectFungibleTokenProvider>
    )
}
