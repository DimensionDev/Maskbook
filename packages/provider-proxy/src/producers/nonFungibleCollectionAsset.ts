// import { getNFTScanNFTList, getOpenSeaCollectionList } from '@masknet/web3-providers'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { collectAllPageDate } from '../helper/request'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'

interface NonFungibleCollectibleAssetArgs extends ProducerArgBase {
    address: string
}

const nonFungibleCollectionAsset = async (
    push: ProducerPushFunction<NonFungibleToken<ChainId, SchemaType>['contract']>,
    getKeys: ProducerKeyFunction,
    args: NonFungibleCollectibleAssetArgs,
): Promise<void> => {
    // const { address } = args
    // const openSeaApiKey = await getKeys('opensea')
    // const pageSize = 50
    // const collectionsFromNFTScan = await getNFTScanNFTList(address)
    // await push(
    //     collectionsFromNFTScan.map((x) => ({
    //         id: x.contractDetailed.address,
    //         chainId: x.contractDetailed.chainId,
    //         name: x.contractDetailed.name,
    //         symbol: x.contractDetailed.symbol,
    //         address: x.contractDetailed.address,
    //         iconURL: x.contractDetailed.iconURL,
    //         balance: x.balance,
    //     })),
    // )
    // const collectionsFromOpenSea = await collectAllPageDate<NonFungibleToken<ChainId, SchemaType>['contract']>(
    //     (page: number) => getOpenSeaCollectionList(openSeaApiKey, address, page, pageSize),
    //     pageSize,
    // )
    // await push(collectionsFromOpenSea)
}

const producer: RPCMethodRegistrationValue<
    NonFungibleToken<ChainId, SchemaType>['contract'],
    NonFungibleCollectibleAssetArgs
> = {
    method: 'mask.fetchNonFungibleCollectionAsset',
    producer: nonFungibleCollectionAsset,
    distinctBy: (item) => item?.address ?? '',
}

export default producer
