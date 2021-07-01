import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { VOICECHAT_META_KEY_1 } from '../constants'
import type { VoiceChatMetadata } from '../types'
import { VoicechatMetadataReader } from '../utils'
import { VoicechatDialog } from './VoicechatDialog'
import { VoicechatInlay } from './VoicechatInlay'

const definition: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        const metadata = VoicechatMetadataReader(props.message.meta)
        if (!metadata.ok) return null
        return <VoicechatInlay metadata={metadata.unwrap()} />
    },
    CompositionDialogMetadataBadgeRender: new Map([[VOICECHAT_META_KEY_1, isActive]]),
    CompositionDialogEntry: {
        label: '🔊 VoiceChat',
        dialog: VoicechatDialog,
    },
}

export default definition

function isActive(payload: VoiceChatMetadata) {
    return !!payload ? 'VoiceChat enabled' : 'VoiceChat disabled'
}
