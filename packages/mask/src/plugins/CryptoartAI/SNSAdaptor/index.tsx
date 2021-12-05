import { uniq } from 'lodash-unified'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { getTypedMessageContent } from '../../../protocols/typed-message'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'
import { PLUGIN_NAME } from '../constants'
import type { CryptoartAI_Payload } from '../types'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const links = usePostInfoDetails.postMetadataMentionedLinks().concat(usePostInfoDetails.postMentionedLinks())
        const link = uniq(links).find(checkUrl)

        const asset = getAssetInfoFromURL(link)

        return asset ? renderPostInspector(asset) : null
    },
    DecryptedInspector: function Component(props) {
        const collectibleUrl = getRelevantUrl(getTypedMessageContent(props.message))
        const asset = getAssetInfoFromURL(collectibleUrl)
        return asset ? renderPostInspector(asset) : null
    },
}

export default sns

function renderPostInspector(payload: CryptoartAI_Payload) {
    return (
        <MaskPluginWrapper pluginName={PLUGIN_NAME}>
            <PostInspector payload={payload} />
        </MaskPluginWrapper>
    )
}
