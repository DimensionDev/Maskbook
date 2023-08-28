import type { FungibleAsset } from '@masknet/web3-shared-base'
import { type ChainId, CHAIN_DESCRIPTORS, type SchemaType, getNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Web3StateRef } from '../Web3/EVM/apis/Web3StateAPI.js'

export function getNativeAssets(): Array<FungibleAsset<ChainId, SchemaType>> {
    const networks = Web3StateRef.value.Network?.networks?.getCurrentValue()
    if (networks)
        return networks.map((x) => ({ ...x.nativeCurrency, address: getNativeTokenAddress(x.chainId), balance: '0' }))

    return CHAIN_DESCRIPTORS.filter((x) => x.network === 'mainnet').map((x) => ({
        ...x.nativeCurrency,
        balance: '0',
    }))
}
