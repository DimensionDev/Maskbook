import { getAlchemyNFTList } from '@masknet/web3-providers'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'
import { collectAllPageData } from '../helper/request'
import type { Web3Plugin } from '@masknet/plugin-infra'

export interface FlowNonFungibleTokenAssetArgs extends ProducerArgBase {
    address: string
    network: Web3Plugin.NetworkDescriptor
}

const flowNonFungibleCollectibleAsset = async (
    push: ProducerPushFunction<Web3Plugin.NonFungibleToken>,
    getKeys: ProducerKeyFunction,
    args: FlowNonFungibleTokenAssetArgs,
): Promise<void> => {
    const { address, network } = args
    const size = 50

    await collectAllPageData<Web3Plugin.NonFungibleToken>(
        (page) =>
            getAlchemyNFTList(address, network, page, size) as Promise<{
                data: Web3Plugin.NonFungibleToken[]
                hasNextPage: boolean
            }>,
        size,
        push,
    )
}

const producer: RPCMethodRegistrationValue<Web3Plugin.NonFungibleToken, FlowNonFungibleTokenAssetArgs> = {
    method: 'mask.fetchFlowNonFungibleCollectibleAsset',
    producer: flowNonFungibleCollectibleAsset,
    distinctBy: (item) => item.id,
}

export default producer
