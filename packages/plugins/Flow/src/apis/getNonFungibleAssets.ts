import type { Pageable, Pagination, Web3Plugin } from '@masknet/plugin-infra'
import type { ProviderProxy } from '@masknet/web3-shared-base'

export const getNonFungibleAssetFn =
    (context: { providerSocket: Promise<ProviderProxy> }) =>
    async (address: string, pagination: Pagination): Promise<Pageable<Web3Plugin.NonFungibleToken>> => {
        const socket = await context.providerSocket
        const socketId = `mask.fetchFlowNonFungibleCollectibleAsset_${address}`
        const data = await socket.sendAsync<Web3Plugin.NonFungibleToken>({
            id: socketId,
            method: 'mask.fetchFlowNonFungibleCollectibleAsset',
            params: { address, pageSize: 100 },
        })
        return {
            hasNextPage: false,
            currentPage: pagination?.page ?? 0,
            data: data,
        }
    }
