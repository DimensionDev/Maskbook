import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { ConfirmSwapDialog } from './UI/ConfirmSwapDialog'
import { TransactionDialog } from './UI/TransactionDialog'
import { SelectTokenDialog } from './UI/SelectTokenDialog'

export const EthereumPluginDefine: PluginConfig = {
    pluginName: 'Ethereum',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Internal,
    PageComponent() {
        return (
            <>
                <TransactionDialog />
                <ConfirmSwapDialog />
                <SelectTokenDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <TransactionDialog />
                <ConfirmSwapDialog />
                <SelectTokenDialog />
            </>
        )
    },
}
