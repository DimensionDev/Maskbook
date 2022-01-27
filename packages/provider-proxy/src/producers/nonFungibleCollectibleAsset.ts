import { getAlchemyNFTList } from '@masknet/web3-providers'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'
import { collectAllPageData } from '../helper/request'
import type { Web3Plugin } from '@masknet/plugin-infra'

export interface NonFungibleTokenAssetArgs extends ProducerArgBase {
    address: string
    network: Web3Plugin.NetworkDescriptor
}

const nonFungibleCollectibleAsset = async (
    push: ProducerPushFunction<ERC721TokenDetailed>,
    getKeys: ProducerKeyFunction,
    args: NonFungibleTokenAssetArgs,
): Promise<void> => {
    const { address, network } = args
    const size = 50
    const openSeaApiKey = await getKeys('opensea')
    try {
        // await collectAllPageData<ERC721TokenDetailed>(
        //     (page) => getOpenSeaNFTList(openSeaApiKey, address, page, size),
        //     size,
        //     push,
        // )

        await collectAllPageData<ERC721TokenDetailed>(
            (page) =>
                getAlchemyNFTList(address, network, page, size) as Promise<{
                    data: ERC721TokenDetailed[]
                    hasNextPage: boolean
                }>,
            size,
            push,
        )
    } finally {
        // await collectAllPageData<ERC721TokenDetailed>(
        //     (page, pageInfo) => getRaribleNFTList(openSeaApiKey, address, page, size, pageInfo),
        //     size,
        //     push,
        // )
    }
}

const producer: RPCMethodRegistrationValue<ERC721TokenDetailed, NonFungibleTokenAssetArgs> = {
    method: 'mask.fetchNonFungibleCollectibleAsset',
    producer: nonFungibleCollectibleAsset,
    distinctBy: (item) =>
        `${item.tokenId.toLowerCase()}_${item.contractDetailed.address.toLowerCase()}_${item.contractDetailed.chainId}`,
}

export default producer
