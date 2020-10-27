import React from 'react'
import { ThemeProvider } from '@material-ui/core'
import type { PluginConfig } from '../plugin'
import { PLUGIN_IDENTIFIER } from './constants'
import { BuyTokenDialog } from './UI/BuyTokenDialog'
import { useMaskbookTheme } from '../../utils/theme'

export const TransakPluginDefine: PluginConfig = {
    pluginName: 'Transak',
    identifier: PLUGIN_IDENTIFIER,
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
