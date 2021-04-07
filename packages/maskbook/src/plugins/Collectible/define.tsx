import { PluginConfig, PluginScope, PluginStage } from '../types'
import { PLUGIN_NAME, PLUGIN_IDENTIFIER } from './constants'
import { PostInspector } from './UI/PostInspector'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import type { CollectibleJSON_Payload } from './UI/types'
import { getRelevantUrl, checkUrl, getAssetInfoFromURL } from './utils'
import { getTypedMessageContent } from '../../protocols/typed-message'
import { usePostInfoDetails } from '../../components/DataSource/usePostInfo'
import { uniq } from 'lodash-es'

export const CollectiblesPluginDefine: PluginConfig = {
    pluginName: PLUGIN_NAME,
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Component(props) {
        // const payload = CollectibleMetadataReader(props.message.meta)
        // if (!payload.ok) return null
        const collectibleUrl = getRelevantUrl(getTypedMessageContent(props.message))
        const asset = getAssetInfoFromURL(collectibleUrl)
        return asset ? renderPostInspector(asset) : null
    },
    postInspector: function Component() {
        const link = uniq(
            usePostInfoDetails('postMetadataMentionedLinks').concat(usePostInfoDetails('postMentionedLinks')),
        ).find(checkUrl)
        const asset = getAssetInfoFromURL(link)

        return asset ? renderPostInspector(asset) : null
    },
}

function renderPostInspector(payload: CollectibleJSON_Payload) {
    return (
        <MaskbookPluginWrapper pluginName="Collectible">
            <PostInspector payload={payload} />
        </MaskbookPluginWrapper>
    )
}
