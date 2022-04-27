export * from './base.js'
export * from './core/index.js'
export * from './extension/index.js'
export * from './binary-encode/index.js'
export * from './deprecated-encode/index.js'
export * from './utils/index.js'
export * from './visitor/index.js'
export * from './transformer/index.js'

import { isCoreTypedMessages, CoreTypedMessages } from './core/index.js'
import { isWellKnownExtensionTypedMessages, WellKnownExtensionTypedMessages } from './extension/index.js'
import { composeSome } from './utils/internal.js'

export type WellKnownTypedMessages = WellKnownExtensionTypedMessages | CoreTypedMessages
export const isWellKnownTypedMessages = composeSome(isCoreTypedMessages, isWellKnownExtensionTypedMessages)
