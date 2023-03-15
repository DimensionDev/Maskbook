import { remove } from 'lodash-es'
import type { ScopedStorage, EnhanceableSite } from '@masknet/shared-base'
import { NonFungibleToken, isSameAddress } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useSubscription } from 'use-subscription'
import { useCallback } from 'react'

interface StorageValue {
    addedTokens: Array<NonFungibleToken<ChainId, SchemaType>>
    userGuide: Partial<Record<EnhanceableSite, number>>
}

export const storageDefaultValue = {
    userGuide: {},
    publicKey: null as null | string,
    addedTokens: [],
}

let storage: ScopedStorage<StorageValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
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
    const settings = storage.storage.userGuide.value
    storage.storage.userGuide.setValue({ ...settings, [site]: TIPS_GUIDE_TOTAL })
}

export const useTipsUserGuide = (site: EnhanceableSite) => {
    const settings = useSubscription(storage?.storage?.userGuide.subscription)

    const setStep = useCallback(
        (to: number) => {
            storage.storage.userGuide.setValue({
                ...settings,
                [site]: to,
            })
        },
        [settings, site],
    )

    const nextStep = useCallback(() => {
        storage.storage.userGuide.setValue({
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
