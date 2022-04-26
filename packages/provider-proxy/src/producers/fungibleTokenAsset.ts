// import { getAssetListFromDebank } from '@masknet/web3-providers'
import type { FungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'

export interface FungibleTokenAssetArgs extends ProducerArgBase {
    address: string
}

const fungibleTokenAsset = async (
    push: ProducerPushFunction<FungibleAsset<ChainId, SchemaType>>,
    getKeys: ProducerKeyFunction,
    args: FungibleTokenAssetArgs,
): Promise<void> => {
    const { address } = args
    // const data = await getAssetListFromDebank(address)
    await push([])
}

const producer: RPCMethodRegistrationValue<FungibleAsset<ChainId, SchemaType>, FungibleTokenAssetArgs> = {
    method: 'mask.fetchFungibleTokenAsset',
    producer: fungibleTokenAsset,
    distinctBy: (item) => `${item.id}_${item.chainId}`,
}

export default producer
