import { v4 as uuid } from 'uuid'
import { omit } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { getRegisteredWeb3Chains, getRegisteredWeb3Networks, type Plugin } from '@masknet/plugin-infra'
import { EMPTY_OBJECT, mapSubscription, type NetworkPluginID, type StorageItem } from '@masknet/shared-base'
import type {
    ReasonableNetwork,
    TransferableNetwork,
    NetworkState as Web3NetworkState,
} from '@masknet/web3-shared-base'

export class NetworkState<ChainId, SchemaType, NetworkType>
    implements Web3NetworkState<ChainId, SchemaType, NetworkType>
{
    public storage: StorageItem<Record<string, ReasonableNetwork<ChainId, SchemaType, NetworkType>>> = null!
    public networks?: Subscription<Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>>

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected options: {
            getNetworkPluginID: () => NetworkPluginID
        },
    ) {
        const { storage } = this.context.createKVStorage('persistent', {}).createSubScope('Network', {
            value: EMPTY_OBJECT,
        })

        this.storage = storage.value

        this.networks = mapSubscription(this.storage.subscription, (storage) => {
            const customizedNetworks = Object.values(storage).sort(
                (a, z) => a.createdAt.getTime() - z.createdAt.getTime(),
            )
            const pluginID = this.options.getNetworkPluginID()
            const registeredChains = getRegisteredWeb3Chains(pluginID)
            const registeredNetworks = getRegisteredWeb3Networks(pluginID)

            return [
                ...registeredNetworks.map((x) => registeredChains.find((y) => y.chainId === x.chainId)!),
                ...customizedNetworks.map((x) => ({
                    ...omit(x, 'createdAt', 'updatedAt'),
                    isCustomized: true,
                })),
            ] as Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>
        })
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

    protected async validateNetwork(network: TransferableNetwork<ChainId, SchemaType, NetworkType>) {
        return true
    }

    async addNetwork(network: TransferableNetwork<ChainId, SchemaType, NetworkType>) {
        const valid = await this.validateNetwork(network)
        if (!valid) throw new Error('Not a valid network.')

        const ID = uuid()
        const now = new Date()

        await this.storage.setValue({
            ...this.storage.value,
            [ID]: {
                ...network,
                ID,
                createdAt: now,
                updatedAt: now,
            },
        })
    }

    async updateNetwork(id: string, updates: Partial<TransferableNetwork<ChainId, SchemaType, NetworkType>>) {
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
