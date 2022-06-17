import { createFungibleToken } from '@masknet/web3-shared-base'
import { getTokenConstants } from '../constants'
import { chainResolver } from './resolver'
import { ChainId, SchemaType } from '../types'

export function createNativeToken(chainId: ChainId) {
    const nativeCurrency = chainResolver.nativeCurrency(chainId)
    return createFungibleToken<ChainId, SchemaType.Native>(
        chainId,
        SchemaType.Native,
        getTokenConstants(chainId).SOL_ADDRESS!,
        nativeCurrency?.name ?? 'Sol',
        nativeCurrency?.symbol ?? 'SOL',
        nativeCurrency?.decimals ?? 9,
        nativeCurrency?.logoURL,
    )
}
