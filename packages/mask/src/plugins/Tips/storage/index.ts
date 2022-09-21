import { remove } from 'lodash-unified'
import type { ScopedStorage , EnhanceableSite } from '@masknet/shared-base'
import { NonFungibleToken, isSameAddress } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

interface StorageValue {
    addedTokens: Array<NonFungibleToken<ChainId, SchemaType>>
    userGuide: Record<EnhanceableSite, number>
}

export const storageDefaultValue = {
    userGuide: {} as Record<EnhanceableSite, number>,
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
export const TIPS_GUIDE_INIT = 0

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

export function getUserGuide(site?: EnhanceableSite) {
    if (!site) return { finished: true, step: TIPS_GUIDE_INIT }
    const setting = storage.storage.userGuide.value ?? { [site]: TIPS_GUIDE_INIT }
    return {
        finished: setting[site] === TIPS_GUIDE_TOTAL,
        step: setting[site] ?? TIPS_GUIDE_INIT,
    }
}

export function finishUserGuide(site: EnhanceableSite) {
    const setting = storage.storage.userGuide.value
    storage.storage.userGuide.setValue({ ...setting, [site]: TIPS_GUIDE_TOTAL })
}
