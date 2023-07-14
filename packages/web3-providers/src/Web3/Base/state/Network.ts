import { v4 as uuid } from 'uuid'
import { omit } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { EMPTY_OBJECT, mapSubscription, type StorageItem } from '@masknet/shared-base'
import type { Network, ReasonableNetwork, NetworkState as Web3NetworkState } from '@masknet/web3-shared-base'

export class NetworkState implements Web3NetworkState {
    public storage: StorageItem<Record<string, Network>> = null!
    public networks?: Subscription<Network[]>

    constructor(protected context: Plugin.Shared.SharedUIContext) {
        const { storage } = this.context.createKVStorage('persistent', {}).createSubScope('Network', {
            value: EMPTY_OBJECT,
        })

        this.storage = storage.value
        this.networks = mapSubscription(this.storage.subscription, (networks) =>
            Object.values(networks).sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime()),
        )
    }

    get ready() {
        return this.storage.initialized
    }

    get readyPromise() {
        return this.storage.initializedPromise
    }

    private assertNetwork(id: string) {
        if (!Object.hasOwn(this.storage.value, id)) throw new Error('Not a valid network ID.')
    }

    private async validateNetwork(network: ReasonableNetwork) {
        return true
    }

    async addNetwork(network: ReasonableNetwork) {
        const valid = await this.validateNetwork(network)
        if (!valid) throw new Error('Not a valid network.')

        const id = uuid()
        const now = new Date()

        await this.storage.setValue({
            ...this.storage.value,
            [id]: {
                ...network,
                createdAt: now,
                updatedAt: now,
            },
        })
    }

    async updateNetwork(id: string, updates: Partial<ReasonableNetwork>) {
        this.assertNetwork(id)

        await this.storage.setValue({
            ...this.storage.value,
            [id]: {
                ...this.storage.value[id],
                ...updates,
                updatedAt: new Date(),
            },
        })
    }

    async removeNetwork(id: string) {
        this.assertNetwork(id)

        await this.storage.setValue(omit(this.storage.value, id))
    }
}
