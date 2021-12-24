import { Collection, getOpenSeaCollectionList } from '@masknet/web3-providers'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RpcMethodRegistrationValue } from '../typs'
import { collectAllPageDate } from '../helper/request'

interface NonFungibleCollectibleAssetArgs extends ProducerArgBase {
    address: string
}

const nonFungibleCollectibleAsset = async (
    push: ProducerPushFunction<Collection>,
    getKeys: ProducerKeyFunction,
    args: NonFungibleCollectibleAssetArgs,
): Promise<void> => {
    const { address } = args
    const openSeaApiKey = await getKeys('opensea')

    const collectFromOpenSea = await collectAllPageDate<Collection>(() =>
        getOpenSeaCollectionList(openSeaApiKey, address),
    )
    await push(collectFromOpenSea)
}

const producer: RpcMethodRegistrationValue<Collection, NonFungibleCollectibleAssetArgs> = {
    method: 'mask.fetchNonFungibleCollectibleAsset',
    producer: nonFungibleCollectibleAsset,
    distinctBy: (item) => item.name,
}

export default producer
