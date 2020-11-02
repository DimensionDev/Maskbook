import React from 'react'
import { PluginStage, PluginConfig, PluginScope } from '../plugin'
import { PLUGIN_IDENTIFIER } from './constants'
import { SelectProviderDialog } from './UI/SelectProviderDialog'
import { SelectWalletDialog } from './UI/SelectWalletDialog'
import { WalletConnectQRCodeDialog } from './UI/WalletConnectQRCodeDialog'

export const WalletPluginDefine: PluginConfig = {
    pluginName: 'Wallet',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    PageComponent() {
        return (
            <>
                <SelectWalletDialog />
                <SelectProviderDialog />
                <WalletConnectQRCodeDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <SelectWalletDialog />
                <SelectProviderDialog />
                <WalletConnectQRCodeDialog />
            </>
        )
    },
}
