import type { FungibleAsset } from '@masknet/web3-shared-base'
import { type ChainId, CHAIN_DESCRIPTORS, type SchemaType, getNativeTokenAddress } from '@masknet/web3-shared-evm'
import { evm } from '../Manager/registry.js'

export function getNativeAssets(): Array<FungibleAsset<ChainId, SchemaType>> {
    const networks = evm.state?.Network?.networks?.getCurrentValue()
    if (networks)
        return networks.map((x) => ({ ...x.nativeCurrency, address: getNativeTokenAddress(x.chainId), balance: '0' }))

    return CHAIN_DESCRIPTORS.filter((x) => x.network === 'mainnet').map((x) => ({
        ...x.nativeCurrency,
        balance: '0',
    }))
}
