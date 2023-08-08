import { v4 as uuid } from 'uuid'
import { omit } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { getRegisteredWeb3Chains, getRegisteredWeb3Networks, type Plugin } from '@masknet/plugin-infra'
import {
    mapSubscription,
    PersistentStorages,
    type NetworkPluginID,
    type StorageObject,
    mergeSubscription,
} from '@masknet/shared-base'
import type {
    ReasonableNetwork,
    TransferableNetwork,
    NetworkState as Web3NetworkState,
} from '@masknet/web3-shared-base'

export class NetworkState<ChainId, SchemaType, NetworkType>
    implements Web3NetworkState<ChainId, SchemaType, NetworkType>
{
    /** default network can't be removed */
    private DEFAULT_NETWORK_ID = '1_ETH'
    public storage: StorageObject<{
        networkID: string
        networks: Record<string, ReasonableNetwork<ChainId, SchemaType, NetworkType>>
    }> = null!

    public networkID?: Subscription<string>
    public network?: Subscription<ReasonableNetwork<ChainId, SchemaType, NetworkType>>
    public networks: Subscription<Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>>

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected options: {
            pluginID: NetworkPluginID
        },
    ) {
        const { storage } = PersistentStorages.Web3.createSubScope(`${this.options.pluginID}_Network`, {
            networkID: this.DEFAULT_NETWORK_ID,
            networks: {},
        })

        this.storage = storage

        this.networkID = this.storage.networkID.subscription

        this.networks = mapSubscription(this.storage.networks.subscription, (storage) => {
            // Newest to oldest
            const customizedNetworks = Object.values(storage).sort(
                (a, z) => z.createdAt.getTime() - a.createdAt.getTime(),
            )
            const registeredChains = getRegisteredWeb3Chains(this.options.pluginID)
            const registeredNetworks = getRegisteredWeb3Networks(this.options.pluginID)

            return [
                ...registeredNetworks.map((x) => registeredChains.find((y) => y.chainId === x.chainId)!),
                ...customizedNetworks.map((x) => ({
                    ...x,
                    isCustomized: true,
                })),
            ] as Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>
        })

        this.network = mapSubscription(
            mergeSubscription(this.storage.networkID.subscription, this.storage.networks.subscription),
            ([networkID, networks]) => networks[networkID],
        )
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
        const network = this.networks.getCurrentValue().find((x) => x.ID === id)
        if (!network) throw new Error('Not a valid network ID.')
        return network
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

    async switchNetwork(id: string) {
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

        // If remove current network, reset to default network
        if (id === this.networkID?.getCurrentValue()) {
            await this.switchNetwork(this.DEFAULT_NETWORK_ID)
        }

        await Promise.all([
            this.storage.networks.setValue(omit(this.storage.networks.value, id)),
            this.networkID?.getCurrentValue() === id ? await this.storage.networkID.setValue('') : Promise.resolve(),
        ])
    }
}
