import type { FungibleAsset } from '@masknet/web3-shared-base'
import { type ChainId, createNativeToken, NETWORK_DESCRIPTORS, type SchemaType } from '@masknet/web3-shared-evm'

export function getNativeAssets(): Array<FungibleAsset<ChainId, SchemaType>> {
    return NETWORK_DESCRIPTORS.filter((x) => x.isMainnet).map((x) => ({
        ...createNativeToken(x.chainId),
        balance: '0',
    }))
}
