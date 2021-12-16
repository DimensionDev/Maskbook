import { isValidAddress } from '@masknet/web3-shared-evm'
import { getAssetsList } from '../..'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { formatAssets } from '../../debank/format'

export interface FungibleTokenAssetArgs extends ProducerArgBase {
    address: string
}

const fungibleTokenAsset = async (
    push: ProducerPushFunction<Web3Plugin.Asset<Web3Plugin.FungibleToken>>,
    getKeys: GetKeyFunction,
    args: FungibleTokenAssetArgs,
): Promise<void> => {
    const { address } = args
    if (!isValidAddress(address)) {
        // TODO: i18n??
        throw new Error('Invalid Address')
    }
    try {
        const data = await getAssetsList(address)
        await push(formatAssets(data))
    } catch {
        // await zerion
        throw new Error('Fetch failed from debank')
    }
}

const producer: Producer<Web3Plugin.Asset<Web3Plugin.FungibleToken>, FungibleTokenAssetArgs> = {
    producerHandler: fungibleTokenAsset,
    unionBy: (item) => `${item.id}_${item.chainId}`,
}

export default producer
