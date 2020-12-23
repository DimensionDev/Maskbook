import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { TransactionDialog } from './UI/TransactionDialog'
import { UnlockERC20TokenDialog } from './UI/UnlockERC20TokenDialog'
import { SelectERC20TokenDialog } from './UI/SelectERC20TokenDialog'

export const EthereumPluginDefine: PluginConfig = {
    pluginName: 'Ethereum',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Internal,
    PageComponent() {
        return (
            <>
                <TransactionDialog />
                <SelectERC20TokenDialog />
                <UnlockERC20TokenDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <TransactionDialog />
                <SelectERC20TokenDialog />
                <UnlockERC20TokenDialog />
            </>
        )
    },
}
