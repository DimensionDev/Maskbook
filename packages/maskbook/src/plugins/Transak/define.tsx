import React from 'react'
import { PluginStage, PluginConfig, PluginScope } from '../plugin'
import { PLUGIN_IDENTIFIER } from './constants'
import { BuyTokenDialog } from './UI/BuyTokenDialog'

export const TransakPluginDefine: PluginConfig = {
    pluginName: 'Transak',
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
