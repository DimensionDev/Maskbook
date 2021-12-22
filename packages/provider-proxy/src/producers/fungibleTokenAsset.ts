import type { Web3Plugin } from '@masknet/plugin-infra'
import { getAssetListByZerion, getAssetListFromDebank } from '@masknet/web3-providers'
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
    try {
        const data = await getAssetListFromDebank(address)
        await push(data)
    } catch {
        try {
            const data = await getAssetListByZerion(address)
            await push(data)
        } catch {
            throw new Error('Fetch failed from debank and zerion')
        }
    }
}

const producer: RpcMethodRegistrationValue<Web3Plugin.Asset<Web3Plugin.FungibleToken>, FungibleTokenAssetArgs> = {
    method: 'mask.fetchFungibleTokenAsset',
    producer: fungibleTokenAsset,
    distinctBy: (item) => `${item.id}_${item.chainId}`,
}

export default producer
