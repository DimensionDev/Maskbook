export * from './base'
export * from './core'
export * from './extension'
export * from './binary-encode'
export * from './deprecated-encode'
export * from './utils'
export * from './visitor'
export * from './transformer'

import { isCoreTypedMessages, CoreTypedMessages } from './core'
import { isWellKnownExtensionTypedMessages, WellKnownExtensionTypedMessages } from './extension'
import { composeSome } from './utils/internal'

export type WellKnownTypedMessages = WellKnownExtensionTypedMessages | CoreTypedMessages
export const isWellKnownTypedMessages = composeSome(isCoreTypedMessages, isWellKnownExtensionTypedMessages)
