import { SelectTokenDialog } from '../Ethereum/UI/SelectTokenDialog'
import { GasNowDialog } from '../Ethereum/UI/GasNowDialog'
import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { CreateWalletDialog } from './UI/CreateWalletDialog'
import { SelectProviderDialog } from './UI/SelectProviderDialog'
import { SelectWalletDialog } from './UI/SelectWalletDialog'
import { WalletConnectQRCodeDialog } from './UI/WalletConnectQRCodeDialog'
import { WalletStatusDialog } from './UI/WalletStatusDialog'
import { WalletRenameWalletDialog } from './UI/RenameWalletDialog'
import { ConnectWalletDialog } from './UI/ConnectWalletDialog'
import { useStartWatchChainState } from './hooks/useStartWatchChainState'

export const WalletPluginDefine: PluginConfig = {
    id: PLUGIN_IDENTIFIER,
    pluginIcon: '💰',
    pluginName: 'Wallet',
    pluginDescription: 'The built-in Ethereum Wallet in Mask Network.',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Internal,
    PageComponent() {
        useStartWatchChainState()
        return (
            <>
                <SelectWalletDialog />
                <SelectProviderDialog />
                <SelectTokenDialog />
                <GasNowDialog />
                <CreateWalletDialog />
                <WalletStatusDialog />
                <ConnectWalletDialog />
                <WalletConnectQRCodeDialog />
                <WalletRenameWalletDialog />
            </>
        )
    },
    DashboardComponent() {
        useStartWatchChainState()
        return (
            <>
                <SelectWalletDialog />
                <SelectProviderDialog />
                <SelectTokenDialog />
                <GasNowDialog />
                <CreateWalletDialog />
                <WalletStatusDialog />
                <ConnectWalletDialog />
                <WalletConnectQRCodeDialog />
                <WalletRenameWalletDialog />
            </>
        )
    },
}
