import { PluginConfig, PluginStage, PluginScope } from '../types'
import { getTypedMessageContent } from '../../protocols/typed-message/types'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { pluginName, identifier } from './constants'
import NFTInPost from './UI/NFTInPost'
import { getRelevantUrl } from './utils'

export const NFTPluginsDefine: PluginConfig = {
    ID: identifier,
    pluginName,
    identifier,
    stage: PluginStage.Beta,
    scope: PluginScope.Internal,
    successDecryptionInspector: function Comp(props) {
        const nftUrl = getRelevantUrl(getTypedMessageContent(props.message))

        return nftUrl ? <NFTInPost nftUrl={nftUrl} /> : null
    },
    postInspector: function Component(): JSX.Element | null {
        const nftUrl = usePostInfoDetails('postMetadataMentionedLinks')
            .concat(usePostInfoDetails('postMentionedLinks'))
            .map(getRelevantUrl)
            .find((url) => Boolean(url))

        return nftUrl ? <NFTInPost nftUrl={nftUrl} /> : null
    },
}
