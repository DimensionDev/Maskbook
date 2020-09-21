import React from 'react'
import type { PluginConfig } from '../plugin'
import { SelectProviderDialog } from './UI/SelectProviderDialog'
import { SelectERC20TokenDialog } from './UI/SelectERC20TokenDialog'
import { PLUGIN_IDENTIFIER } from './constants'

export const WalletPluginDefine: PluginConfig = {
    pluginName: 'Wallet',
    identifier: PLUGIN_IDENTIFIER,
    pageInspector() {
        return (
            <>
                <SelectProviderDialog />
                <SelectERC20TokenDialog />
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
