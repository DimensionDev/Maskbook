import { PluginConfig, PluginScope, PluginStage } from '../types'
import { PLUGIN_NAME, PLUGIN_IDENTIFIER } from './constants'
import { composeJSON_Payload, CollectibleMetadataReader } from './helpers'
import { PostInspector } from './UI/PostInspector'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'
import type { CollectibleJSON_Payload } from './types'

export const CollectiblesPluginDefine: PluginConfig = {
    pluginName: PLUGIN_NAME,
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Component(props) {
        const payload = CollectibleMetadataReader(props.message.meta)
        if (!payload.ok) return null
        return renderPostInspector(payload.val)
    },
    postInspector: function Component() {
        return renderPostInspector(composeJSON_Payload())
    },
}

function renderPostInspector(payload: CollectibleJSON_Payload) {
    return (
        <MaskbookPluginWrapper pluginName="Collectible">
            <PostInspector payload={payload} />
        </MaskbookPluginWrapper>
    )
}
