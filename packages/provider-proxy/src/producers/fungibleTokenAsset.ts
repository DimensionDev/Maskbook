import type { Web3Plugin } from '@masknet/plugin-infra'
import { getDebankAssetsList } from '@masknet/web3-providers'

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
        const data = await getDebankAssetsList(address)
        await push(data)
    } catch {
        // await zerion
        throw new Error('Fetch failed from debank')
    }
}

const producer: RpcMethodRegistrationValue<Web3Plugin.Asset<Web3Plugin.FungibleToken>, FungibleTokenAssetArgs> = {
    producer: fungibleTokenAsset,
    keyHasher: (item) => `${item.id}_${item.chainId}`,
}

export default producer
