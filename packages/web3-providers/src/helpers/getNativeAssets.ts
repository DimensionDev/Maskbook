import type { FungibleAsset } from '@masknet/web3-shared-base'
import { ChainId, createNativeToken, NETWORK_DESCRIPTORS, SchemaType } from '@masknet/web3-shared-evm'

export function getNativeAssets(): Array<FungibleAsset<ChainId, SchemaType>> {
    return NETWORK_DESCRIPTORS.map((x) => ({
        ...createNativeToken(x.chainId),
        balance: '0',
    }))
}
