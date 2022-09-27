import { remove } from 'lodash-unified'
import { useSubscription } from 'use-subscription'
import type { EnhanceableSite, ScopedStorage } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isSameAddress } from '@masknet/web3-shared-base'
export interface StorageValue {
    addedTokens: Array<Web3Helper.NonFungibleTokenScope<'all'>>
    userGuide: Partial<Record<EnhanceableSite, number>>
}

export const STORAGE_DEFAULT_VALUE: StorageValue = {
    addedTokens: [],
    userGuide: {},
}

let storage: ScopedStorage<StorageValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}

export const TIPS_GUIDE_TOTAL = 1
export const TIPS_GUIDE_INIT = 0

export function getTokens() {
    return storage.storage.addedTokens.value
}

export async function addToken(token: Web3Helper.NonFungibleTokenScope<'all'>) {
    const tokens = [token, ...getTokens()]
    await storage.storage.addedTokens.setValue(tokens)
}

export async function removeToken(address: string, tokenId: string) {
    const tokens = getTokens()
    remove(tokens, (t) => t.tokenId === tokenId && isSameAddress(t.contract?.address, address))
    await storage.storage.addedTokens.setValue(tokens)
}

export function finishUserGuide(site: EnhanceableSite) {
    const settings = storage.storage.userGuide.value
    storage.storage.userGuide.setValue({ ...settings, [site]: TIPS_GUIDE_TOTAL })
}

export const useTipsUserGuide = (site?: EnhanceableSite) => {
    const settings = useSubscription(storage?.storage?.userGuide.subscription)

    if (!site) return { finished: true, step: TIPS_GUIDE_INIT }

    return {
        finished: settings[site] === TIPS_GUIDE_TOTAL,
        step: settings[site] ?? TIPS_GUIDE_INIT,
    }
}
