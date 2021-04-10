import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { ConfirmSwapDialog } from './UI/ConfirmSwapDialog'
import { TransactionDialog } from './UI/TransactionDialog'

export const EthereumPluginDefine: PluginConfig = {
    ID: PLUGIN_IDENTIFIER,
    pluginIcon: '♦️',
    pluginName: 'Ethereum',
    pluginDescription: 'Shared Ethereum Unlities.',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Internal,
    PageComponent() {
        return (
            <>
                <TransactionDialog />
                <ConfirmSwapDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <TransactionDialog />
                <ConfirmSwapDialog />
            </>
        )
    },
}
