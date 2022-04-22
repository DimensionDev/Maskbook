export * from './anchor.js'
export * from './MaskPayload.js'

import { composeSome } from '../utils/internal.js'
import * as anchor from './anchor.js'
import * as MaskPayload from './MaskPayload.js'
export type WellKnownExtensionTypedMessages = anchor.TypedMessageAnchor | MaskPayload.TypedMessageMaskPayload

export const isWellKnownExtensionTypedMessages = composeSome(
    anchor.isTypedMessageAnchor,
    MaskPayload.isTypedMessageMaskPayload,
)
