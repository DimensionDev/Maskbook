import { uniq } from 'lodash-unified'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import type { CollectibleJSON_Payload } from '../types'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'
import { PLUGIN_NAME, PLUGIN_PROFILE_TAB_NAME } from '../constants'
import { getTypedMessageContent } from '../../../protocols/typed-message'
import { NFTPage } from './NFTPage'

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

    ProfileTabs: [
        {
            ID: PLUGIN_NAME,
            label: PLUGIN_PROFILE_TAB_NAME,
            priority: 1,
            children: ({ addressNames = [] }) => <NFTPage address={addressNames[0].resolvedAddress} />,
        },
    ],
}

export default sns

function renderPostInspector(payload: CollectibleJSON_Payload) {
    return (
        <MaskPluginWrapper pluginName={PLUGIN_NAME}>
            <PostInspector payload={payload} />
        </MaskPluginWrapper>
    )
}
