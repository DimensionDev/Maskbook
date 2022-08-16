export * from './asyncIterator.js'
export * from './detect.js'
export * from './getLocalImplementation.js'
export * from './parseURL.js'
export * from './pollingTask.js'
export * from './subscription.js'
export * from './getAssetAsBlobURL.js'
export * from './personas.js'
export * from './createValueRefWithReady.js'

export enum MimeTypes {
    JSON = 'application/json',
    Binary = 'application/octet-stream',
}

export type PartialRequired<T, RequiredKeys extends keyof T> = Omit<T, RequiredKeys> & Pick<Required<T>, RequiredKeys>
