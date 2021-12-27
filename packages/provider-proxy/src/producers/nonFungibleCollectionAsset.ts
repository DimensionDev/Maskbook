import { Collection, getOpenSeaCollectionList } from '@masknet/web3-providers'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'
import { collectAllPageDate } from '../helper/request'

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

    const collectFromOpenSea = await collectAllPageDate<Collection>(() =>
        getOpenSeaCollectionList(openSeaApiKey, address),
    )
    await push(collectFromOpenSea)
}

// TODO: rename method name
const producer: RPCMethodRegistrationValue<Collection, NonFungibleCollectibleAssetArgs> = {
    method: 'mask.fetchNonFungibleCollectibleAsset',
    producer: nonFungibleCollectionAsset,
    distinctBy: (item) => item.name,
}

export default producer
