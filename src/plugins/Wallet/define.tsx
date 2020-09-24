import React from 'react'
import type { PluginConfig } from '../plugin'
import { SelectProviderDialog } from './UI/SelectProviderDialog'
import { PLUGIN_IDENTIFIER } from './constants'

export const WalletPluginDefine: PluginConfig = {
    pluginName: 'Wallet',
    identifier: PLUGIN_IDENTIFIER,
    pageInspector() {
        return (
            <>
                <SelectProviderDialog />
            </>
        )
    },
    dashboardInspector() {
        return (
            <>
                <SelectProviderDialog />
            </>
        )
    },
}
