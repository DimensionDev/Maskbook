import { PluginConfig, PluginStage, PluginScope } from '../types'
import { getTypedMessageContent } from '../../protocols/typed-message/types'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { identifier } from './constants'
import NFTInPost from './UI/NFTInPost'
import { getRelevantUrl } from './utils'

export const NFT_PluginsDefine: PluginConfig = {
    ID: identifier,
    pluginIcon: '🖼',
    pluginName: 'NFT',
    pluginDescription: 'An NFT collectible viewer.',
    identifier,
    stage: PluginStage.Beta,
    scope: PluginScope.Public,
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
