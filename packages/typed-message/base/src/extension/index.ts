import { composeSome } from '../utils/internal.js'
import * as anchor from './anchor.js'
import * as MaskPayload from './MaskPayload.js'

export * from './anchor.js'
export * from './MaskPayload.js'

/** This key can be used in meta. It represents CSS when rendering this message. */
export const unstable_STYLE_META = 'unstable_STYLE'
export type WellKnownExtensionTypedMessages = anchor.TypedMessageAnchor | MaskPayload.TypedMessageMaskPayload

export const isWellKnownExtensionTypedMessages = composeSome(
    anchor.isTypedMessageAnchor,
    MaskPayload.isTypedMessageMaskPayload,
)
