import { PluginConfig, PluginStage, PluginScope } from '../types'
import { isTypedMessageAnchor, isTypedMessageText } from '../../protocols/typed-message/types'
import { pluginName, identifier } from './constants'
import NFTInPost from './UI/NFTInPost'
import { getRelevantUrl } from './utils'

export const NFTPluginsDefine: PluginConfig = {
    pluginName,
    identifier,
    stage: PluginStage.Beta,
    scope: PluginScope.Internal,
    successDecryptionInspector: function Comp(props) {
        let nftUrl: URL | null = null

        if (isTypedMessageText(props.message)) nftUrl = getRelevantUrl(props.message.content)
        else if (isTypedMessageAnchor(props.message)) nftUrl = getRelevantUrl(props.message.href)

        if (nftUrl) return <NFTInPost nftUrl={nftUrl} />
        else return null
    },
}
