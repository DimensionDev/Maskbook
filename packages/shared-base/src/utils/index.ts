export * from './asyncIterator'
export * from './detect'
export * from './getLocalImplementation'
export * from './parseURL'
export * from './pollingTask'
export * from './sessionStorageCache'
export * from './subscription'
export * from './getAssetAsBlobURL'
export * from './personas'
export * from './createValueRefWithReady'

export enum MimeTypes {
    JSON = 'application/json',
    Binary = 'application/octet-stream',
}

export type PartialRequired<T, RequiredKeys extends keyof T> = Omit<T, RequiredKeys> & Pick<Required<T>, RequiredKeys>
