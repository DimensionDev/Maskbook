import type { PluginConfig } from '../plugin'
import { pluginName, identifier } from './constants'

export const FileServicePluginDefine: PluginConfig = {
    pluginName,
    identifier,
    successDecryptionInspector(props) {
        return null
    },
}
