import type { PropsWithChildren } from 'react'
import { ConfirmProvider } from './Confirm/index.js'
import { SelectFungibleTokenProvider } from './SelectFungibleTokenDialog/index.js'
import { SelectGasSettingsProvider } from './SelectAdvancedSettingsDialog/index.js'
import { compose } from '@masknet/shared-base'

export * from './Confirm/index.js'
export * from './SelectFungibleTokenDialog/index.js'
export * from './SelectAdvancedSettingsDialog/index.js'

export function CommonUIProvider({ children }: PropsWithChildren<{}>) {
    return compose(
        (children) => ConfirmProvider({ children }),
        (children) => SelectFungibleTokenProvider({ children }),
        (children) => SelectGasSettingsProvider({ children }),
        <>{children}</>,
    )
}
