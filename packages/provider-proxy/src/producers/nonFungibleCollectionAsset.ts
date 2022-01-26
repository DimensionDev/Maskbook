import { getOpenSeaCollectionList } from '@masknet/web3-providers'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'
import { collectAllPageData } from '../helper/request'

interface Collection {
    name: string
    image?: string
    slug: string
}

interface NonFungibleCollectibleAssetArgs extends ProducerArgBase {
    address: string
}

const nonFungibleCollectionAsset = async (
    push: ProducerPushFunction<Collection>,
    getKeys: ProducerKeyFunction,
    args: NonFungibleCollectibleAssetArgs,
): Promise<void> => {
    const { address } = args
    const openSeaApiKey = await getKeys('opensea')

    const pageSize = 50
    const collectFromOpenSea = await collectAllPageData<Collection>(
        (page: number) => getOpenSeaCollectionList(openSeaApiKey, address, page, pageSize),
        pageSize,
    )
    await push(collectFromOpenSea)
}

const producer: RPCMethodRegistrationValue<Collection, NonFungibleCollectibleAssetArgs> = {
    method: 'mask.fetchNonFungibleCollectionAsset',
    producer: nonFungibleCollectionAsset,
    distinctBy: (item) => item.name,
}

export default producer
