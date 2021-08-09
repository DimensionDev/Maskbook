export * from './base'
export * from './extension'
export * from './utils'
export * from './core'
import { isWellKnownExtensionTypedMessages, WellKnownExtensionTypedMessages } from './extension'
import { composeSome } from './utils/internal'
import { isWellKnownCoreTypedMessages, WellKnownCoreTypedMessages } from './core'
export type WellKnownTypedMessages = WellKnownCoreTypedMessages | WellKnownExtensionTypedMessages
export const isWellKnownTypedMessages = composeSome(isWellKnownCoreTypedMessages, isWellKnownExtensionTypedMessages)
