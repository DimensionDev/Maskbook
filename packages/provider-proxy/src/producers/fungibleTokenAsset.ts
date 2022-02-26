import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { getAssetListFromDebank } from '@masknet/web3-providers'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'

export interface FungibleTokenAssetArgs extends ProducerArgBase {
    address: string
}

const fungibleTokenAsset = async (
    push: ProducerPushFunction<Web3Plugin.FungibleAsset>,
    getKeys: ProducerKeyFunction,
    args: FungibleTokenAssetArgs,
): Promise<void> => {
    const { address } = args
    const data = await getAssetListFromDebank(address)
    await push(data)
}

const producer: RPCMethodRegistrationValue<Web3Plugin.FungibleAsset, FungibleTokenAssetArgs> = {
    method: 'mask.fetchFungibleTokenAsset',
    producer: fungibleTokenAsset,
    distinctBy: (item) => `${item.id}_${item.chainId}`,
}

export default producer
