import { createTypedMessageMetadataReader } from '../../../protocols/typed-message/metadata'
import type { TypedMessage } from '../../../protocols/typed-message'
import type { Result } from 'ts-results'
import type { VoiceChatMetadata } from '../types'
import { VOICECHAT_META_KEY_1 } from '../constants'
import schema from '../schema.json'

export function VoicechatMetadataReader(meta: TypedMessage['meta']): Result<VoiceChatMetadata, void> {
    const reader = createTypedMessageMetadataReader<VoiceChatMetadata>(VOICECHAT_META_KEY_1, schema)

    return reader(meta)
}
