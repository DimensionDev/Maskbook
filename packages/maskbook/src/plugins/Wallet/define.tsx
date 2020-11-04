import React from 'react'
import { PluginConfig, PluginStage, PluginScope } from '../types'
import { TransactionDialog } from '../../web3/UI/TransactionDialog'
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
                <TransactionDialog />
                <SelectWalletDialog />
                <SelectProviderDialog />
                <WalletConnectQRCodeDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <TransactionDialog />
                <SelectWalletDialog />
                <SelectProviderDialog />
                <WalletConnectQRCodeDialog />
            </>
        )
    },
}
