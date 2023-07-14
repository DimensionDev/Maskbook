import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { EMPTY_LIST, type StorageItem } from '@masknet/shared-base'
import type { Network, NetworkState as Web3NetworkState } from '@masknet/web3-shared-base'

export class NetworkState implements Web3NetworkState {
    public storage: StorageItem<Network[]> = null!
    public networks?: Subscription<Network[]>

    constructor(protected context: Plugin.Shared.SharedUIContext) {
        const { storage } = this.context.createKVStorage('persistent', {}).createSubScope('Network', {
            value: EMPTY_LIST,
        })

        this.storage = storage.value
        this.networks = this.storage.subscription
    }

    get ready() {
        return this.storage.initialized
    }

    get readyPromise() {
        return this.storage.initializedPromise
    }

    addNetwork: (network: Network) => Promise<void>
    updateNetwork: (id: string, updates: Omit<Partial<Network>, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
    removeNetwork: (id: string) => Promise<void>
}
