export * from './base'
export * from './extension'
export * from './utils'
export * from './core'
export * from './metadata'
import { isWellKnownExtensionTypedMessages, WellKnownExtensionTypedMessages } from './extension'
import { composeSome } from './utils/internal'
import { isWellKnownCoreTypedMessages, WellKnownCoreTypedMessages } from './core'
export type WellKnownTypedMessages = WellKnownCoreTypedMessages | WellKnownExtensionTypedMessages
export const isWellKnownTypedMessages = composeSome(isWellKnownCoreTypedMessages, isWellKnownExtensionTypedMessages)
export { encodeTypedMessageToDocument } from './binary-encode/encode'
export { decodeTypedMessageFromDocument } from './binary-encode/decode'
export * from './deprecated-encode'
