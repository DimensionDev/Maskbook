import type { ScopedStorage, EnhanceableSite } from '@masknet/shared-base'
import { type NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useSubscription } from 'use-subscription'
import { useCallback } from 'react'

interface StorageValue {
    addedTokens: Array<NonFungibleToken<ChainId, SchemaType>>
}

export const storageDefaultValue = {
    publicKey: null as null | string,
    addedTokens: [],
}

interface GuideStorage {
    userGuide: Partial<Record<EnhanceableSite, number>>
}

// TODO Keep this for 5 versions until 2.23
const legacyStorageStep = localStorage.getItem('plugin_userGuide_com.maskbook.tip_mirror.xyz')
export const guideStorageDefaultValue: GuideStorage = {
    userGuide: {
        'mirror.xyz': legacyStorageStep ? Number.parseInt(legacyStorageStep, 10) : undefined,
    },
}

let storage: ScopedStorage<StorageValue> = null!
let guideStorage: ScopedStorage<GuideStorage> = null!

export function setupStorage(_: typeof storage, _guideStorage: typeof guideStorage) {
    storage = _
    guideStorage = _guideStorage
}

export function getStorage() {
    return storage.storage
}

const TIPS_GUIDE_TOTAL = 1
const TIPS_GUIDE_INIT = 1

export const useTipsUserGuide = (site: EnhanceableSite) => {
    const settings = useSubscription(guideStorage?.storage?.userGuide.subscription)

    const setStep = useCallback(
        async (to: number) => {
            await guideStorage.storage.userGuide.setValue({
                ...settings,
                [site]: to,
            })
        },
        [settings, site],
    )

    const step = settings[site] ?? TIPS_GUIDE_INIT
    const nextStep = useCallback(async () => {
        await guideStorage.storage.userGuide.setValue({
            ...settings,
            [site]: step + 1,
        })
    }, [settings, step, site])

    return {
        finished: step > TIPS_GUIDE_TOTAL,
        step,
        setStep,
        nextStep,
    }
}
