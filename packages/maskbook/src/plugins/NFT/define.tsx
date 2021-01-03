import { PluginConfig, PluginStage, PluginScope } from '../types'
import { pluginName, identifier } from './constants'

export const NFTPluginsDefine: PluginConfig = {
    pluginName,
    identifier,
    stage: PluginStage.Beta,
    scope: PluginScope.Internal,
    successDecryptionInspector: function Comp(props) {
        return null
    }
}
