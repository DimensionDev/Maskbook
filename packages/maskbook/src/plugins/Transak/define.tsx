import React from 'react'
import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { BuyTokenDialog } from './UI/BuyTokenDialog'

export const TransakPluginDefine: PluginConfig = {
    pluginName: 'Transak',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Development,
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
