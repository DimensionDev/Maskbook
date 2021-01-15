import { PluginConfig, PluginStage, PluginScope } from '../types'
import { getTypedMessageContent } from '../../protocols/typed-message/types'
import { pluginName, identifier } from './constants'
import NFTInPost from './UI/NFTInPost'
import { getRelevantUrl } from './utils'

export const NFTPluginsDefine: PluginConfig = {
    pluginName,
    identifier,
    stage: PluginStage.Beta,
    scope: PluginScope.Internal,
    successDecryptionInspector: function Comp(props) {
        let nftUrl = getRelevantUrl(getTypedMessageContent(props.message))
        return nftUrl ? <NFTInPost nftUrl={nftUrl} /> : null
    },
}
