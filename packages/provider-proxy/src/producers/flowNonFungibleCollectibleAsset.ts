import { getAlchemyFlowNFTList } from '@masknet/web3-providers'
import type { ProducerArgBase, ProducerKeyFunction, ProducerPushFunction, RPCMethodRegistrationValue } from '../types'
import { collectAllPageDate } from '../helper/request'
import type { Web3Plugin } from '@masknet/plugin-infra'

export interface FlowNonFungibleTokenAssetArgs extends ProducerArgBase {
    address: string
}

const flowNonFungibleCollectibleAsset = async (
    push: ProducerPushFunction<Web3Plugin.NonFungibleToken>,
    getKeys: ProducerKeyFunction,
    args: FlowNonFungibleTokenAssetArgs,
): Promise<void> => {
    const { address } = args
    const size = 50

    await collectAllPageDate<Web3Plugin.NonFungibleToken>(
        (page) => getAlchemyFlowNFTList(address, page, size),
        size,
        push,
    )
}

const producer: RPCMethodRegistrationValue<Web3Plugin.NonFungibleToken, FlowNonFungibleTokenAssetArgs> = {
    method: 'mask.fetchFlowNonFungibleCollectibleAsset',
    producer: flowNonFungibleCollectibleAsset,
    distinctBy: (item) => item.id,
}

export default producer
