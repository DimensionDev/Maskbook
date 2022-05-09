import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ScopedStorage } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { remove } from 'lodash-unified'

interface StorageValue {
    addedTokens: Web3Plugin.NonFungibleToken[]
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

export function storeToken(token: Web3Plugin.NonFungibleToken) {
    const tokens = [token, ...getTokens()]
    storage.storage.addedTokens.setValue(tokens)
}

export function deleteToken(address: string, tokenId: string) {
    const tokens = getTokens()
    remove(tokens, (t) => t.tokenId === tokenId && isSameAddress(t.contract?.address, address))
    storage.storage.addedTokens.setValue(tokens)
}
