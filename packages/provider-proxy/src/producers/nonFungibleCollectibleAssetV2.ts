import { getOpenSeaNFTList, getRaribleNFTList, getNFTScanNFTs, getAlchemyNFTList } from '@masknet/web3-providers'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-base'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'
import { collectAllPageData } from '../helper/request'
import { Web3Plugin, PluginId } from '@masknet/plugin-infra'

export interface NonFungibleTokenAssetArgs extends ProducerArgBase {
    address: string
    networkList: Web3Plugin.NetworkDescriptor[]
}

const nonFungibleCollectibleAsset = async (
    push: ProducerPushFunction<ERC721TokenDetailed>,
    getKeys: ProducerKeyFunction,
    args: NonFungibleTokenAssetArgs,
): Promise<void> => {
    const { address, networkList, pageSize = 100 } = args

    const allRequest = networkList.map(async (network) => {
        try {
            const queryFromOpensea = async () => {
                const openSeaApiKey = await getKeys('opensea')
                await collectAllPageData<ERC721TokenDetailed>(
                    (page) => getOpenSeaNFTList(openSeaApiKey, address, page, pageSize),
                    pageSize,
                    push,
                )
            }

            const fromAlchemy = collectAllPageData<ERC721TokenDetailed>(
                async (page, {}, pageKey) => {
                    const r = (await getAlchemyNFTList(address, network, page, pageSize, pageKey)) as {
                        data: ERC721TokenDetailed[]
                        hasNextPage: boolean
                        pageKey?: string
                        total?: number
                    }
                    return r
                },
                pageSize,
                push,
            )

            await Promise.allSettled([network.ID === `${PluginId.EVM}_ethereum` && queryFromOpensea(), fromAlchemy])
        } finally {
            if (network.ID !== `${PluginId.EVM}_ethereum`) return

            const fromRarible = collectAllPageData<ERC721TokenDetailed>(
                (page, pageInfo) => getRaribleNFTList(address, page, pageSize, pageInfo),
                pageSize,
                push,
            )

            const formNFTScanERC721 = collectAllPageData<ERC721TokenDetailed>(
                (page) => getNFTScanNFTs(address, 'erc721', page, pageSize),
                pageSize,
                push,
            )

            const fromNFTScanERC1155 = collectAllPageData<ERC721TokenDetailed>(
                (page) => getNFTScanNFTs(address, 'erc1155', page, pageSize),
                pageSize,
                push,
            )

            await Promise.allSettled([fromRarible, formNFTScanERC721, fromNFTScanERC1155])
        }
    })

    await Promise.allSettled(allRequest)
}

const producer: RPCMethodRegistrationValue<ERC721TokenDetailed, NonFungibleTokenAssetArgs> = {
    method: 'mask.fetchNonFungibleCollectibleAssetV2',
    producer: nonFungibleCollectibleAsset,
    distinctBy: (item) =>
        `${item.tokenId.toLowerCase()}_${item.contractDetailed.address.toLowerCase()}_${item.contractDetailed.chainId}`,
}

export default producer
