import type { PluginConfig } from '../plugin'
import { PLUGIN_IDENTIFIER, PLUGIN_METADATA_KEY } from './constants'

export const TransactionPluginDefine: PluginConfig = {
    pluginName: 'Transaction',
    identifier: PLUGIN_IDENTIFIER,
    postDialogMetadataBadge: new Map([[PLUGIN_METADATA_KEY, (meta) => 'no metadata']]),
    pageInspector() {
        return null
    },
}
