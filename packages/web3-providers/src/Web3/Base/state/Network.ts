import { omit } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import { getRegisteredWeb3Chains, getRegisteredWeb3Networks } from '../../../Manager/index.js'
import { mapSubscription, type NetworkPluginID, mergeSubscription, type StorageItem } from '@masknet/shared-base'
import type {
    ReasonableNetwork,
    TransferableNetwork,
    NetworkState as Web3NetworkState,
} from '@masknet/web3-shared-base'

export abstract class NetworkState<ChainId, SchemaType, NetworkType>
    implements Web3NetworkState<ChainId, SchemaType, NetworkType>
{
    /** default network can't be removed */
    private DEFAULT_NETWORK_ID = '1_ETH'

    public networkID: Subscription<string>
    public network: Subscription<ReasonableNetwork<ChainId, SchemaType, NetworkType>>
    public networks: Subscription<Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>>

    constructor(
        private pluginID: NetworkPluginID,
        private networkIDStorage: StorageItem<string>,
        private networksStorage: StorageItem<Record<string, ReasonableNetwork<ChainId, SchemaType, NetworkType>>>,
    ) {
        if (!networkIDStorage.initialized || !networksStorage.initialized) throw new Error('Storage not initialized')
        this.networkID = this.networkIDStorage.subscription

        this.networks = mapSubscription(this.networksStorage.subscription, (storage) => {
            // Newest to oldest
            const customizedNetworks = Object.values(storage).sort(
                (a, z) => z.createdAt.getTime() - a.createdAt.getTime(),
            )
            const registeredChains = getRegisteredWeb3Chains(this.pluginID)
            const registeredNetworks = getRegisteredWeb3Networks(this.pluginID)

            return [
                ...registeredNetworks
                    .filter((x) => x.isMainnet)
                    .map((x) => registeredChains.find((y) => y.chainId === x.chainId)!),
                ...customizedNetworks.map((x) => ({
                    ...x,
                    isCustomized: true,
                })),
            ] as Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>
        })

        this.network = mapSubscription(
            mergeSubscription(this.networkIDStorage.subscription, this.networksStorage.subscription),
            ([networkID, networks]) => networks[networkID],
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

        const ID = crypto.randomUUID()
        const now = new Date()

        await this.networksStorage.setValue({
            ...this.networksStorage.value,
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

        await this.networkIDStorage.setValue(id)
    }

    async updateNetwork(id: string, updates: Partial<TransferableNetwork<ChainId, SchemaType, NetworkType>>) {
        const network = this.assertNetwork(id)

        await this.networksStorage.setValue({
            ...this.networksStorage.value,
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
        if (id === this.networkID.getCurrentValue()) {
            await this.switchNetwork(this.DEFAULT_NETWORK_ID)
        }

        await Promise.all([
            this.networksStorage.setValue(omit(this.networksStorage.value, id)),
            this.networkID.getCurrentValue() === id ? await this.networkIDStorage.setValue('') : Promise.resolve(),
        ])
    }
}
