import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { BuyTokenDialog } from './UI/BuyTokenDialog'

export const TransakPluginDefine: PluginConfig = {
    ID: PLUGIN_IDENTIFIER,
    pluginIcon: '💸',
    pluginName: 'Transak',
    pluginDescription: 'The Fiat On-Ramp Aggregator on Mask Network.',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    PageComponent() {
        return (
            <>
                <BuyTokenDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <BuyTokenDialog />
            </>
        )
    },
}
