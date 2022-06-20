import { remove } from 'lodash-unified'
import type { ScopedStorage } from '@masknet/shared-base'
import { NonFungibleToken, isSameAddress } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

interface StorageValue {
    addedTokens: Array<NonFungibleToken<ChainId, SchemaType>>
}

export const storageDefaultValue = {
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
