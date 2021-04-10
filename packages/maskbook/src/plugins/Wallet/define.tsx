import { SelectTokenDialog } from '../Ethereum/UI/SelectTokenDialog'
import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { CreateWalletDialog } from './UI/CreateWalletDialog'
import { SelectProviderDialog } from './UI/SelectProviderDialog'
import { SelectWalletDialog } from './UI/SelectWalletDialog'
import { WalletConnectQRCodeDialog } from './UI/WalletConnectQRCodeDialog'
import { WalletStatusDialog } from './UI/WalletStatusDialog'

export const WalletPluginDefine: PluginConfig = {
    ID: PLUGIN_IDENTIFIER,
    pluginIcon: '💰',
    pluginName: 'Wallet',
    pluginDescription: 'The built-in Ethereum Wallet in Mask Network.',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Internal,
    PageComponent() {
        return (
            <>
                <SelectWalletDialog />
                <SelectProviderDialog />
                <SelectTokenDialog />
                <CreateWalletDialog />
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
                <SelectTokenDialog />
                <CreateWalletDialog />
                <WalletStatusDialog />
                <WalletConnectQRCodeDialog />
            </>
        )
    },
}
