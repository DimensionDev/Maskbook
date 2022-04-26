// import { getOpenSeaNFTList, getRaribleNFTList, getNFTScanNFTs } from '@masknet/web3-providers'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'
// import { collectAllPageDate } from '../helper/request'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface NonFungibleTokenAssetArgs extends ProducerArgBase {
    address: string
}

const nonFungibleCollectibleAsset = async (
    push: ProducerPushFunction<NonFungibleToken<ChainId, SchemaType>>,
    getKeys: ProducerKeyFunction,
    args: NonFungibleTokenAssetArgs,
): Promise<void> => {
    // const { address } = args
    // const size = 50
    // const openSeaApiKey = await getKeys('opensea')
    // try {
    //     await collectAllPageDate<NonFungibleToken<ChainId, SchemaType>>(
    //         (page) => getOpenSeaNFTList(openSeaApiKey, address, page, size),
    //         size,
    //         push,
    //     )
    // } finally {
    //     try {
    //         await collectAllPageDate<NonFungibleToken<ChainId, SchemaType>>(
    //             (page, pageInfo) => getRaribleNFTList(address, page, size, pageInfo),
    //             size,
    //             push,
    //         )
    //     } finally {
    //         await collectAllPageDate<NonFungibleToken<ChainId, SchemaType>>(
    //             (page) => getNFTScanNFTs(address, 'erc721', page, size),
    //             size,
    //             push,
    //         )
    //         await collectAllPageDate<NonFungibleToken<ChainId, SchemaType>>(
    //             (page) => getNFTScanNFTs(address, 'erc1155', page, size),
    //             size,
    //             push,
    //         )
    //     }
    // }
}

const producer: RPCMethodRegistrationValue<NonFungibleToken<ChainId, SchemaType>, NonFungibleTokenAssetArgs> = {
    method: 'mask.fetchNonFungibleCollectibleAsset',
    producer: nonFungibleCollectibleAsset,
    distinctBy: (item) => `${item.tokenId.toLowerCase()}_${item.address.toLowerCase()}_${item.chainId}`,
}

export default producer
