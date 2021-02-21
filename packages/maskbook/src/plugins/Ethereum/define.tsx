import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { ConfirSwapDialog } from './UI/ConfirmSwapDialog'
import { TransactionDialog } from './UI/TransactionDialog'

export const EthereumPluginDefine: PluginConfig = {
    pluginName: 'Ethereum',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Internal,
    PageComponent() {
        return (
            <>
                <TransactionDialog />
                <ConfirSwapDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <TransactionDialog />
                <ConfirSwapDialog />
            </>
        )
    },
}
