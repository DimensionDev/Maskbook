import { getAlchemyNFTList } from '@masknet/web3-providers'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'
import { collectAllPageData } from '../helper/request'
import type { Web3Plugin, ERC721TokenDetailed } from '@masknet/plugin-infra'

export interface FlowNonFungibleTokenAssetArgs extends ProducerArgBase {
    address: string
    network: Web3Plugin.NetworkDescriptor
}

const flowNonFungibleCollectibleAsset = async (
    push: ProducerPushFunction<ERC721TokenDetailed>,
    getKeys: ProducerKeyFunction,
    args: FlowNonFungibleTokenAssetArgs,
): Promise<void> => {
    const { address, network } = args
    const size = 50

    await collectAllPageData<ERC721TokenDetailed>(
        (page) =>
            getAlchemyNFTList(address, network, page, size) as Promise<{
                data: ERC721TokenDetailed[]
                hasNextPage: boolean
            }>,
        size,
        push,
    )
}

const producer: RPCMethodRegistrationValue<ERC721TokenDetailed, FlowNonFungibleTokenAssetArgs> = {
    method: 'mask.fetchFlowNonFungibleCollectibleAsset',
    producer: flowNonFungibleCollectibleAsset,
    distinctBy: (item) => item.contractDetailed.address + item.tokenId,
}

export default producer
