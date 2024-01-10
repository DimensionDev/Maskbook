import type { Plugin } from '@masknet/plugin-infra'
import { type StorageObject } from '@masknet/shared-base'
import { type LensStorageType } from './types.js'

export let lensStorage: StorageObject<LensStorageType>

export async function setupStorage(x: Plugin.SiteAdaptor.SiteAdaptorContext) {
    const result = x.createKVStorage('persistent', {}).createSubScope<LensStorageType>('LensToken', {})
    await Promise.all([result.storage.accessToken?.initializedPromise, result.storage.refreshToken?.initializedPromise])
    lensStorage = result.storage
}
