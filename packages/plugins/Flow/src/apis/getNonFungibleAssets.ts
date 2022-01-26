import type { Pageable, Pagination, Web3Plugin } from '@masknet/plugin-infra'
import { getProxyWebsocketInstance, NotifyFn } from '@masknet/web3-shared-base'

export const getNonFungibleAssets = async (
    address: string,
    pagination: Pagination,
    providerType?: string,
    network?: Web3Plugin.NetworkDescriptor,
    other?: { [key in string]: unknown },
): Promise<Pageable<Web3Plugin.NonFungibleToken>> => {
    const socket = await getProxyWebsocketInstance()
    const socketId = `mask.fetchFlowNonFungibleCollectibleAsset_${address}`
    socket.send({
        id: socketId,
        method: 'mask.fetchFlowNonFungibleCollectibleAsset',
        params: { address, network, pageSize: 100 },
        notify: other?.notify as NotifyFn,
    })
    const data = socket.getResult<Web3Plugin.NonFungibleToken>(socketId)
    return {
        hasNextPage: false,
        currentPage: pagination?.page ?? 0,
        data: data,
    }
}
