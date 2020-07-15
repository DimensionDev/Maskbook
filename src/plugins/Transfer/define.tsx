import type { PluginConfig } from '../plugin'
import { TransferMetaKey } from './TransferMetakey'

export const TransferPluginDefine: PluginConfig = {
    pluginName: 'Transfer',
    identifier: 'com.maskbook.transfer',
    successDecryptionInspector() {
        return null
    },
    postDialogMetadataBadge: new Map([[TransferMetaKey, (payload) => 'a transfer badge']]),
}
