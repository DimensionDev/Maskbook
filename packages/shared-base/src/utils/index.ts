export * from './ValueRef.js'
export * from './asyncIterator.js'
export * from './attachRectangle.js'
export * from './compose.js'
export * from './createDeviceFingerprint.js'
export * from './createDeviceSeed.js'
export * from './createLookupTableResolver.js'
export * from './getLocalImplementation.js'
export * from './isDashboardPage.js'
export * from './isDeviceOnWhitelist.js'
export * from './isPopupPage.js'
export * from './markdown.js'
export * from './mixin.js'
export * from './personas.js'
export * from './resolve.js'
export * from './subscription.js'

export enum SignType {
    Message = 'message',
    TypedData = 'typedData',
    Transaction = 'transaction',
}

export enum MimeType {
    JSON = 'application/json',
    Binary = 'application/octet-stream',
    PNG = 'image/png',
}

export type PartialRequired<T, RequiredKeys extends keyof T> = Omit<T, RequiredKeys> & Pick<Required<T>, RequiredKeys>
