import { remove } from 'lodash-es'
import type { ScopedStorage, EnhanceableSite } from '@masknet/shared-base'
import { NonFungibleToken, isSameAddress } from '@masknet/web3-shared-base'
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

export const guideStorageDefaultValue = {
    userGuide: {},
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

export const TIPS_GUIDE_TOTAL = 1
export const TIPS_GUIDE_INIT = 1

export function getTokens() {
    return storage.storage.addedTokens.value
}

export function storeToken(token: NonFungibleToken<ChainId, SchemaType>) {
    const tokens = [token, ...getTokens()]
    storage.storage.addedTokens.setValue(tokens)
}

export function deleteToken(address: string, tokenId: string) {
    const tokens = getTokens()
    remove(tokens, (t) => t.tokenId === tokenId && isSameAddress(t.contract?.address, address))
    storage.storage.addedTokens.setValue(tokens)
}

export function finishUserGuide(site: EnhanceableSite) {
    const settings = guideStorage.storage.userGuide.value
    guideStorage.storage.userGuide.setValue({ ...settings, [site]: TIPS_GUIDE_TOTAL })
}

export const useTipsUserGuide = (site: EnhanceableSite) => {
    const settings = useSubscription(guideStorage?.storage?.userGuide.subscription)

    const setStep = useCallback(
        (to: number) => {
            guideStorage.storage.userGuide.setValue({
                ...settings,
                [site]: to,
            })
        },
        [settings, site],
    )

    const nextStep = useCallback(() => {
        guideStorage.storage.userGuide.setValue({
            ...settings,
            [site]: settings[site]! + 1,
        })
    }, [settings, site])

    return {
        finished: settings[site] === TIPS_GUIDE_TOTAL,
        step: settings[site] ?? TIPS_GUIDE_INIT,
        setStep,
        nextStep,
    }
}
