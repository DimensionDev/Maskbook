import type { ERC721TokenCollectionInfo } from '@masknet/plugin-infra'
import { getNFTScanNFTList, getOpenSeaCollectionList } from '@masknet/web3-providers'
import { collectAllPageData } from '../helper/request'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'

interface NonFungibleCollectibleAssetArgs extends ProducerArgBase {
    address: string
}

const nonFungibleCollectionAsset = async (
    push: ProducerPushFunction<ERC721TokenCollectionInfo>,
    getKeys: ProducerKeyFunction,
    args: NonFungibleCollectibleAssetArgs,
): Promise<void> => {
    const { address } = args
    const openSeaApiKey = await getKeys('opensea')

    const pageSize = 50
    const collectionsFromNFTScan = await getNFTScanNFTList(address)
    await push(
        collectionsFromNFTScan.map((x) => ({
            chainId: x.contractDetailed.chainId,
            name: x.contractDetailed.name,
            symbol: x.contractDetailed.symbol,
            address: x.contractDetailed.address,
            iconURL: x.contractDetailed.iconURL,
            balance: x.balance,
        })),
    )

    const collectionsFromOpenSea = await collectAllPageData<ERC721TokenCollectionInfo>(
        (page: number) => getOpenSeaCollectionList(openSeaApiKey, address, page, pageSize),
        pageSize,
    )
    await push(collectionsFromOpenSea)
}

const producer: RPCMethodRegistrationValue<ERC721TokenCollectionInfo, NonFungibleCollectibleAssetArgs> = {
    method: 'mask.fetchNonFungibleCollectionAsset',
    producer: nonFungibleCollectionAsset,
    distinctBy: (item) => item.address,
}

export default producer
