import { uniq } from 'lodash-unified'
import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import MaskPluginWrapper from '../../MaskPluginWrapper'
import { PostInspector } from './PostInspector'
import { base } from '../base'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'
import { PLUGIN_NAME } from '../constants'
import type { PayloadType } from '../types'
import { extractTextFromTypedMessage } from '@masknet/typed-message/base'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = uniq(links).find(checkUrl)

        const asset = getAssetInfoFromURL(link)

        return asset ? renderPostInspector(asset) : null
    },
    DecryptedInspector: function Component(props) {
        const collectibleUrl = getRelevantUrl(extractTextFromTypedMessage(props.message).unwrapOr(''))
        const asset = getAssetInfoFromURL(collectibleUrl)
        return asset ? renderPostInspector(asset) : null
    },
}

export default sns

function renderPostInspector(payload: PayloadType) {
    return (
        <MaskPluginWrapper pluginName={PLUGIN_NAME}>
            <PostInspector payload={payload} />
        </MaskPluginWrapper>
    )
}
