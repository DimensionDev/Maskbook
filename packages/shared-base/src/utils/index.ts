export * from './attachRectangle.js'
export * from './ValueRef.js'
export * from './asyncIterator.js'
export * from './compose.js'
export * from './createLookupTableResolver.js'
export * from './getLocalImplementation.js'
export * from './getDefaultWalletName.js'
export * from './getDefaultWalletPassword.js'
export * from './markdown.js'
export * from './mixin.js'
export * from './personas.js'
export * from './resolve.js'
export * from './subscription.js'
export * from './getDomainSystem.js'
export * from './parseURL.js'
export * from './generateContactAvatarColor.js'

export type PartialRequired<T, RequiredKeys extends keyof T> = Omit<T, RequiredKeys> & Pick<Required<T>, RequiredKeys>

export type UnboxPromise<T> = T extends Promise<infer U> ? U : never
