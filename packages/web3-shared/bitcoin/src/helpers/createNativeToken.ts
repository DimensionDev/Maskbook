import { createFungibleToken } from '@masknet/web3-shared-base'
import { type ChainId, SchemaType } from '../types/index.js'
import { ZERO_ADDRESS, getTokenConstant } from '../constants/index.js'
import { chainResolver } from './resolvers.js'

export function createNativeToken(chainId: ChainId) {
    const nativeCurrency = chainResolver.nativeCurrency(chainId)
    return createFungibleToken<ChainId, SchemaType.Native>(
        chainId,
        SchemaType.Native,
        getTokenConstant(chainId, 'NATIVE_TOKEN_ADDRESS', ZERO_ADDRESS)!,
        nativeCurrency?.name ?? 'Ether',
        nativeCurrency?.symbol ?? 'ETH',
        nativeCurrency?.decimals ?? 18,
        nativeCurrency?.logoURL,
    )
}
