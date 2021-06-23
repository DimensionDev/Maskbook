import { uniq } from 'lodash-es'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { getTypedMessageContent } from '../../../protocols/typed-message'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import type { CollectibleJSON_Payload } from '../types'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'
import { PLUGIN_NAME } from '../constants'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const link = uniq(
            usePostInfoDetails.postMetadataMentionedLinks().concat(usePostInfoDetails.postMentionedLinks()),
        ).find(checkUrl)
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

function renderPostInspector(payload: CollectibleJSON_Payload) {
    return (
        <MaskbookPluginWrapper pluginName={PLUGIN_NAME}>
            <PostInspector payload={payload} />
        </MaskbookPluginWrapper>
    )
}
