import { remove } from 'lodash-unified'
import type { ScopedStorage } from '@masknet/shared-base'
import { NonFungibleToken, isSameAddress } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

interface StorageValue {
    addedTokens: Array<NonFungibleToken<ChainId, SchemaType>>
    addressMap: Record<string, string[]>
    accountVerifiedMap: Record<string, boolean>
    personaPubkeyMap: Record<string, string>
}

export const storageDefaultValue = {
    publicKey: null as null | string,
    addedTokens: [],
    addressMap: {},
    accountVerifiedMap: {},
    personaPubkeyMap: {},
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

export function getAddresses(key: string) {
    return storage.storage.addressMap.value[key] ?? []
}
export function setAddresses(key: string, addresses: string[]) {
    storage.storage.addressMap.setValue({
        ...storage.storage.addressMap.value,
        [key]: addresses,
    })
}
export function setAccountVerified(key: string, accountVerified: boolean) {
    storage.storage.accountVerifiedMap.setValue({
        ...storage.storage.accountVerifiedMap.value,
        [key]: accountVerified,
    })
}

export function setPersonaPubkey(key: string, pubkey: string) {
    storage.storage.personaPubkeyMap.setValue({
        ...storage.storage.personaPubkeyMap.value,
        [key]: pubkey,
    })
}

export function deleteToken(address: string, tokenId: string) {
    const tokens = getTokens()
    remove(tokens, (t) => t.tokenId === tokenId && isSameAddress(t.contract?.address, address))
    storage.storage.addedTokens.setValue(tokens)
}
