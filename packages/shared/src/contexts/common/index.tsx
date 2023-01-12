import type { PropsWithChildren } from 'react'
import { ConfirmProvider } from './Confirm/index.js'
import { SelectFungibleTokenProvider } from './SelectFungibleTokenDialog/index.js'
import { SelectGasSettingsProvider } from './SelectAdvancedSettingsDialog/index.js'

export * from './Confirm/index.js'
export * from './SelectFungibleTokenDialog/index.js'
export * from './SelectAdvancedSettingsDialog/index.js'
export * from './Log/index.js'

export function CommonUIProvider({ children }: PropsWithChildren<{}>) {
    return (
        <ConfirmProvider>
            <SelectFungibleTokenProvider>
                <SelectGasSettingsProvider>{children}</SelectGasSettingsProvider>
            </SelectFungibleTokenProvider>
        </ConfirmProvider>
    )
}
