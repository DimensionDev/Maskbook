import React from 'react'
import { PluginStage, PluginConfig } from '../plugin'
import { PLUGIN_IDENTIFIER } from './constants'
import { BuyTokenDialog } from './UI/BuyTokenDialog'

export const TransakPluginDefine: PluginConfig = {
    pluginName: 'Transak',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
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
