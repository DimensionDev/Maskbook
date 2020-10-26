import React from 'react'
import type { PluginConfig } from '../plugin'
import { PLUGIN_IDENTIFIER } from './constants'
import { BuyTokenDialog } from './UI/BuyTokenDialog'

export const TransakPluginDefine: PluginConfig = {
    pluginName: 'Transak',
    identifier: PLUGIN_IDENTIFIER,
    pageInspector() {
        return <BuyTokenDialog />
    },
    dashboardInspector() {
        return <BuyTokenDialog />
    },
}
