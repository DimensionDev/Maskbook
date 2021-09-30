import { uniq } from 'lodash-es'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { getTypedMessageContent } from '../../../protocols/typed-message'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import type { CollectibleJSON_Payload } from '../types'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'
import { PLUGIN_NAME } from '../constants'
import { FACEBOOK_ID } from '../../../social-network-adaptor/facebook.com/base'
import { activatedSocialNetworkUI } from '../../../social-network'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const isFacebookLink = activatedSocialNetworkUI.networkIdentifier === FACEBOOK_ID

        const links = usePostInfoDetails
            .postMetadataMentionedLinks()
            .concat(usePostInfoDetails.postMentionedLinks())
            .map((v) => {
                return !isFacebookLink ? v : v.replace(/\?fbclid=[\S\s]*#/, '#')
            })

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

function renderPostInspector(payload: CollectibleJSON_Payload) {
    return (
        <MaskPluginWrapper pluginName={PLUGIN_NAME}>
            <PostInspector payload={payload} />
        </MaskPluginWrapper>
    )
}
