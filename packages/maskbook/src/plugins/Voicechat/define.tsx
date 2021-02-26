import { PluginConfig, PluginStage, PluginScope } from '../types'
import { PLUGIN_IDENTIFIER } from './constants'
import { VoicechatDialog } from './UI/VoicechatDialog'
import { VoicechatInlay } from './UI/VoicechatInlay'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import { VoicechatMetadataReader } from './utils'
import { VOICECHAT_META_KEY_1 } from './constants'
import type { VoiceChatMetadata } from './types'

const [VoicechatCompositionEntry, VoicechatDialogUI] = createCompositionDialog('🔊 Voicechat', (props) => (
    <VoicechatDialog open={props.open} onConfirm={props.onClose} onDecline={props.onClose} />
))

export const VoicechatPluginDefine: PluginConfig = {
    pluginName: 'Voicechat',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Beta,
    scope: PluginScope.Internal,
    PageComponent: VoicechatDialogUI,
    successDecryptionInspector: function Dom(props) {
        const metadata = VoicechatMetadataReader(props.message.meta)

        if (!metadata.ok) return null

        return <VoicechatInlay metadata={metadata.unwrap()} />
    },
    postDialogEntries: [VoicechatCompositionEntry],
    postDialogMetadataBadge: new Map([[VOICECHAT_META_KEY_1, isActive]]),
}

function isActive(payload: VoiceChatMetadata) {
    return !!payload ? 'Voicechat enabled' : 'Voicechat disabled'
}
