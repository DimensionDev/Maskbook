import type { PropsWithChildren } from 'react'
import { SelectGasSettingsProvider } from './SelectAdvancedSettingsDialog/index.js'
import { AddCollectiblesProvider } from './AddCollectiblesDialog/index.js'

export * from './SelectAdvancedSettingsDialog/index.js'
export * from './AddCollectiblesDialog/index.js'

export function CommonUIProvider({ children }: PropsWithChildren<{}>) {
    return (
        <AddCollectiblesProvider>
            <SelectGasSettingsProvider>{children}</SelectGasSettingsProvider>
        </AddCollectiblesProvider>
    )
}
