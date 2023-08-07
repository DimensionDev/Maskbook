import type { FungibleAsset } from '@masknet/web3-shared-base'
import { type ChainId, CHAIN_DESCRIPTORS, type SchemaType } from '@masknet/web3-shared-evm'

export function getNativeAssets(): Array<FungibleAsset<ChainId, SchemaType>> {
    return CHAIN_DESCRIPTORS.filter((x) => x.network === 'mainnet').map((x) => ({
        ...x.nativeCurrency,
        balance: '0',
    }))
}
