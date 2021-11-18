import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { getTypedMessageContent } from '../../../protocols/typed-message'
import { base } from '../base'
import { getRelevantUrl } from '../utils'
import NFTInPost from './NFTInPost'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component(): JSX.Element | null {
        const nftUrl = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .map(getRelevantUrl)
            .find((url) => Boolean(url))

        return nftUrl ? <NFTInPost nftUrl={nftUrl} /> : null
    },
    DecryptedInspector: function Comp(props) {
        const nftUrl = getRelevantUrl(getTypedMessageContent(props.message))

        return nftUrl ? <NFTInPost nftUrl={nftUrl} /> : null
    },
}

export default sns
