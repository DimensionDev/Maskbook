import React from 'react'
import type { PluginConfig } from '../plugin'
import { PLUGIN_IDENTIFIER } from './constants'
import { SelectProviderDialog } from './UI/SelectProviderDialog'
import { WalletConnectQRCodeDialog } from './UI/WalletConnectQRCodeDialog'

export const WalletPluginDefine: PluginConfig = {
    pluginName: 'Wallet',
    identifier: PLUGIN_IDENTIFIER,
    pageInspector() {
        return (
            <>
                <SelectProviderDialog />
                <WalletConnectQRCodeDialog />
            </>
        )
    },
    dashboardInspector() {
        return (
            <>
                <SelectProviderDialog />
                <WalletConnectQRCodeDialog />
            </>
        )
    },
}
