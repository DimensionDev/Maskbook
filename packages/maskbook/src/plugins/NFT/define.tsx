import { PluginConfig, PluginStage, PluginScope } from '../types'
import { pluginName, identifier } from './constants'
import NFTInPost from './UI/NFTInPost'
import { getRelevantUrl } from './utils'

export const NFTPluginsDefine: PluginConfig = {
    pluginName,
    identifier,
    stage: PluginStage.Beta,
    scope: PluginScope.Internal,
    successDecryptionInspector: function Comp(props) {
        const nftUrl: URL = getRelevantUrl('')
        return <NFTInPost nftUrl={nftUrl} />
    },
}
