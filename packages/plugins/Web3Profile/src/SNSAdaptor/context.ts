import type { Plugin } from '@masknet/plugin-infra'
import { type StorageObject } from '@masknet/shared-base'
import { type LensTokenStorageType } from './types.js'

export let lensTokenStorage: StorageObject<LensTokenStorageType>

export async function setupStorage(x: Plugin.SNSAdaptor.SNSAdaptorContext) {
    const result = x.createKVStorage('persistent', {}).createSubScope<LensTokenStorageType>('LensToken', {})
    await result.storage.accessToken?.initializedPromise
    await result.storage.refreshToken?.initializedPromise
    lensTokenStorage = result.storage
}
