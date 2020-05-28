import { merge } from 'lodash-es'
import { MutexStorage } from './MutexStorage'
import type { Appearance, Language } from '../components/shared-settings/settings'
import type { EthereumNetwork } from '../plugins/Wallet/database/types'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext(['options', 'background'], 'storage')

export interface GeneralSettingsStorage {
    debugMode: boolean
    'eth network': EthereumNetwork
    'disable automated tab task open new tab': boolean
    'render in shadow root': boolean
    apperance: Appearance
    language: Language
    importingBackup: boolean
    'matrix-account': [string, string]
}

export interface NetworkSpecificSettingsStorage {
    currentImagePayloadStatus: boolean
    currentSelectedIdentity: string
    currentImmersiveSetupStatus: string
}

export interface NetworkSpecificFeaturesStorage {
    forceDisplayWelcome: boolean
    userIgnoredWelcome: boolean
}

export type Storage = Partial<GeneralSettingsStorage & NetworkSpecificSettingsStorage & NetworkSpecificFeaturesStorage>

const storage = new MutexStorage<Storage>()

export async function getStorage<T extends Storage>(key: string): Promise<T> {
    if (typeof browser === 'undefined' || !browser.storage) return {} as T
    return ((storage as unknown) as MutexStorage<T>).getStorage(key)
}

export async function setStorage<T extends Storage>(key: string, value: T) {
    if (typeof browser === 'undefined' || !browser.storage) return
    return storage.setStorage(key, merge(await getStorage<T>(key), value))
}
