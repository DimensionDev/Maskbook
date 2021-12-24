import type { Web3Plugin } from '@masknet/plugin-infra'
import { getAssetListFromDebank } from '@masknet/web3-providers'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RpcMethodRegistrationValue } from '../typs'

export interface FungibleTokenAssetArgs extends ProducerArgBase {
    address: string
}

const fungibleTokenAsset = async (
    push: ProducerPushFunction<Web3Plugin.Asset<Web3Plugin.FungibleToken>>,
    getKeys: ProducerKeyFunction,
    args: FungibleTokenAssetArgs,
): Promise<void> => {
    const { address } = args
    const data = await getAssetListFromDebank(address)
    await push(data)
    // const data = await getAssetListByZerion(address)
    // await push(data)
}

const producer: RpcMethodRegistrationValue<Web3Plugin.Asset<Web3Plugin.FungibleToken>, FungibleTokenAssetArgs> = {
    method: 'mask.fetchFungibleTokenAsset',
    producer: fungibleTokenAsset,
    distinctBy: (item) => `${item.id}_${item.chainId}`,
}

export default producer
