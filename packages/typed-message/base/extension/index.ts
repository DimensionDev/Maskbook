export * from './anchor'
export * from './MaskPayload'

import { composeSome } from '../utils/internal'
import * as anchor from './anchor'
import * as MaskPayload from './MaskPayload'
export type WellKnownExtensionTypedMessages = anchor.TypedMessageAnchor | MaskPayload.TypedMessageMaskPayload

export const isWellKnownExtensionTypedMessages = composeSome(
    anchor.isTypedMessageAnchor,
    MaskPayload.isTypedMessageMaskPayload,
)
