import React from 'react'
import type { PluginConfig } from '../plugin'
import { SelectProviderDialog } from './UI/SelectProviderDialog'
import { PLUGIN_IDENTIFIER, PLUGIN_METADATA_KEY } from './constants'

export const WalletPluginDefine: PluginConfig = {
    pluginName: 'Wallet',
    identifier: PLUGIN_IDENTIFIER,
    postDialogMetadataBadge: new Map([[PLUGIN_METADATA_KEY, (meta) => 'no metadata']]),
    pageInspector() {
        return <SelectProviderDialog />
    },
}
