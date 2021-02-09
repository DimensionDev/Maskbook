import { SelectERC20TokenDialog } from '../Ethereum/UI/SelectERC20TokenDialog'
import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { SelectProviderDialog } from './UI/SelectProviderDialog'
import { SelectWalletDialog } from './UI/SelectWalletDialog'
import { WalletConnectQRCodeDialog } from './UI/WalletConnectQRCodeDialog'
import { WalletStatusDialog } from './UI/WalletStatusDialog'

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
                <SelectERC20TokenDialog />
                <WalletStatusDialog />
                <WalletConnectQRCodeDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <SelectWalletDialog />
                <SelectProviderDialog />
                <SelectERC20TokenDialog />
                <WalletStatusDialog />
                <WalletConnectQRCodeDialog />
            </>
        )
    },
}
