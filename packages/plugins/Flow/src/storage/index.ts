import type { User } from '@blocto/fcl'
import type { ScopedStorage } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-flow'

export const StorageDefaultValue = {
    chainId: ChainId.Mainnet,
    user: null as User | null,
}

let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}
