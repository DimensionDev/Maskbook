import { createFungibleToken } from '@masknet/web3-shared-base'
import { getTokenConstants } from '../constants'
import { ChainId, SchemaType } from '../types'
import { chainResolver } from './resolver'

export function createNativeToken(chainId: ChainId) {
    const nativeCurrency = chainResolver.nativeCurrency(chainId)
    return createFungibleToken<ChainId, SchemaType.Fungible>(
        chainId,
        SchemaType.Fungible,
        getTokenConstants(chainId).FLOW_ADDRESS!,
        nativeCurrency?.name ?? 'Flow',
        nativeCurrency?.symbol ?? 'FLOW',
        nativeCurrency?.decimals ?? 8,
        nativeCurrency?.logoURL,
    )
}
