import { v4 as uuid } from 'uuid'
import { omit } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { getRegisteredWeb3Chains, getRegisteredWeb3Networks, type Plugin } from '@masknet/plugin-infra'
import { mapSubscription, PersistentStorages, type NetworkPluginID, type StorageObject } from '@masknet/shared-base'
import type {
    ReasonableNetwork,
    TransferableNetwork,
    NetworkState as Web3NetworkState,
} from '@masknet/web3-shared-base'

export class NetworkState<ChainId, SchemaType, NetworkType>
    implements Web3NetworkState<ChainId, SchemaType, NetworkType>
{
    public storage: StorageObject<{
        networkID: string
        networks: Record<string, ReasonableNetwork<ChainId, SchemaType, NetworkType>>
    }> = null!

    public networkID?: Subscription<string>
    public networks?: Subscription<Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>>

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected options: {
            pluginID: NetworkPluginID
        },
    ) {
        const { storage } = PersistentStorages.Web3.createSubScope(`${this.options.pluginID}_Network`, {
            networkID: '',
            networks: {},
        })

        this.storage = storage

        this.networks = mapSubscription(this.storage.networks.subscription, (storage) => {
            const customizedNetworks = Object.values(storage).sort(
                (a, z) => a.createdAt.getTime() - z.createdAt.getTime(),
            )
            const registeredChains = getRegisteredWeb3Chains(this.options.pluginID)
            const registeredNetworks = getRegisteredWeb3Networks(this.options.pluginID)

            return [
                ...registeredNetworks.map((x) => registeredChains.find((y) => y.chainId === x.chainId)!),
                ...customizedNetworks.map((x) => ({
                    ...omit(x, 'createdAt', 'updatedAt'),
                    isCustomized: true,
                })),
            ] as Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>
        })

        this.networkID = this.storage.networkID.subscription
    }

    get ready() {
        return this.storage.networkID.initialized && this.storage.networks.initialized
    }

    get readyPromise() {
        return Promise.all([this.storage.networkID.initializedPromise, this.storage.networks.initializedPromise]).then(
            () => {},
        )
    }

    private assertNetwork(id: string) {
        if (!Object.hasOwn(this.storage.networks.value, id)) throw new Error('Not a valid network ID.')
        return this.storage.networks.value[id]
    }

    protected async validateNetwork(network: TransferableNetwork<ChainId, SchemaType, NetworkType>) {
        return true
    }

    protected async pingNetwork(network: TransferableNetwork<ChainId, SchemaType, NetworkType>) {
        return true
    }

    async addNetwork(network: TransferableNetwork<ChainId, SchemaType, NetworkType>) {
        const valid = await this.validateNetwork(network)
        if (!valid) throw new Error('Not a valid network.')

        const ID = uuid()
        const now = new Date()

        await this.storage.networks.setValue({
            ...this.storage.networks.value,
            [ID]: {
                ...network,
                ID,
                createdAt: now,
                updatedAt: now,
            },
        })
    }

    async useNetwork(id: string) {
        const network = this.assertNetwork(id)

        const valid = await this.pingNetwork(network)
        if (!valid) throw new Error('Cannot build connection with the network at this time, please try again later.')

        await this.storage.networkID.setValue(id)
    }

    async updateNetwork(id: string, updates: Partial<TransferableNetwork<ChainId, SchemaType, NetworkType>>) {
        const network = this.assertNetwork(id)

        await this.storage.networks.setValue({
            ...this.storage.networks.value,
            [id]: {
                ...network,
                ...updates,
                updatedAt: new Date(),
            },
        })
    }

    async removeNetwork(id: string) {
        this.assertNetwork(id)

        await this.storage.networks.setValue(omit(this.storage.networks.value, id))
    }
}
