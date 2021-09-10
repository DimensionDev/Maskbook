import { createPluginMessage } from '@masknet/plugin-infra'
import type { TypedMessage } from '@masknet/shared-base'
import Serialization from '../../utils/type-transform/Serialization'
import type { MaskSDK_SNS_ContextIdentifier } from './sns-context'

// Make TS happy
import type { UnboundedRegistry } from '@dimensiondev/holoflows-kit'
type A = UnboundedRegistry<{}>
export interface ExternalPluginMessage {
    // When a SNS page get this event, if it know this context, it should response the challenge with pong.
    ping: { context: MaskSDK_SNS_ContextIdentifier; challenge: number }
    pong: number
    appendComposition: {
        payload: TypedMessage['meta']
        appendText: string
        context: MaskSDK_SNS_ContextIdentifier
    }
}

export const ExternalPluginMessages = createPluginMessage<ExternalPluginMessage>('io.maskbook.external', Serialization)
