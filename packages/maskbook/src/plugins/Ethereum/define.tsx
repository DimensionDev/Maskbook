import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { TransactionDialog } from './UI/TransactionDialog'

export const EthereumPluginDefine: PluginConfig = {
    id: PLUGIN_IDENTIFIER,
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
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <TransactionDialog />
            </>
        )
    },
}
