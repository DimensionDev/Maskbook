export * from './asyncIterator.js'
export * from './isPopupPage.js'
export * from './isDashboardPage.js'
export * from './getLocalImplementation.js'
export * from './markdown.js'
export * from './mixin.js'
export * from './personas.js'
export * from './subscription.js'
export * from './ValueRef.js'
export * from './resolve.js'
export * from './compose.js'
export * from './createLookupTableResolver.js'

export enum SignType {
    Message = 'message',
    TypedData = 'typedData',
    Transaction = 'transaction',
}

export enum MimeType {
    JSON = 'application/json',
    Binary = 'application/octet-stream',
}

export type PartialRequired<T, RequiredKeys extends keyof T> = Omit<T, RequiredKeys> & Pick<Required<T>, RequiredKeys>
