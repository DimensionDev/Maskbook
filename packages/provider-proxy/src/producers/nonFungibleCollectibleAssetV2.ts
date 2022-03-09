import { getOpenSeaNFTList, getRaribleNFTList, getNFTScanNFTs } from '@masknet/web3-providers'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'
import { collectAllPageDate } from '../helper/request'

export interface NonFungibleTokenAssetArgs extends ProducerArgBase {
    address: string
}

const nonFungibleCollectibleAsset = async (
    push: ProducerPushFunction<ERC721TokenDetailed>,
    getKeys: ProducerKeyFunction,
    args: NonFungibleTokenAssetArgs,
): Promise<void> => {
    const { address } = args
    const size = 50
    const openSeaApiKey = await getKeys('opensea')

    try {
        await collectAllPageDate<ERC721TokenDetailed>(
            (page) => getOpenSeaNFTList(openSeaApiKey, address, page, size),
            size,
            push,
        )
    } finally {
        const fromRarible = collectAllPageDate<ERC721TokenDetailed>(
            (page, pageInfo) => getRaribleNFTList(address, page, size, pageInfo),
            size,
            push,
        )

        const formNFTScanERC721 = collectAllPageDate<ERC721TokenDetailed>(
            (page) => getNFTScanNFTs(address, 'erc721', page, size),
            size,
            push,
        )

        const fromNFTScanERC1155 = collectAllPageDate<ERC721TokenDetailed>(
            (page) => getNFTScanNFTs(address, 'erc1155', page, size),
            size,
            push,
        )

        await Promise.allSettled([fromRarible, formNFTScanERC721, fromNFTScanERC1155])
    }
}

const producer: RPCMethodRegistrationValue<ERC721TokenDetailed, NonFungibleTokenAssetArgs> = {
    method: 'mask.fetchNonFungibleCollectibleAssetV2',
    producer: nonFungibleCollectibleAsset,
    distinctBy: (item) =>
        `${item.tokenId.toLowerCase()}_${item.contractDetailed.address.toLowerCase()}_${item.contractDetailed.chainId}`,
}

export default producer
