import { getOpenSeaNFTList } from '@masknet/web3-providers'
import type { ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RpcMethodRegistrationValue } from '../typs'

export interface NonFungibleTokenAssetArgs extends ProducerArgBase {
    address: string
}

const nonFungibleTokenAsset = async (
    push: ProducerPushFunction<ERC721TokenDetailed>,
    getKeys: ProducerKeyFunction,
    args: NonFungibleTokenAssetArgs,
): Promise<void> => {
    const { address } = args
    // todo: key word
    const openSeaApiKey = await getKeys('OpenSea')

    let openSeaHasNextPage = true
    while (openSeaHasNextPage) {
        const dataFromOpenSea = await getOpenSeaNFTList(openSeaApiKey, address)
        await push(dataFromOpenSea.assets)
        openSeaHasNextPage = !!dataFromOpenSea.hasNextPage
    }
}

const producer: RpcMethodRegistrationValue<ERC721TokenDetailed, NonFungibleTokenAssetArgs> = {
    method: 'mask.fetchNonFungibleTokenAsset',
    producer: nonFungibleTokenAsset,
    distinctBy: (item) => `${item.tokenId}_${item.contractDetailed.address}`,
}

export default producer
