import { createFungibleToken } from '@masknet/web3-shared-base'
import { getTokenConstant, ZERO_ADDRESS } from '../constants'
import { ChainId, SchemaType } from '../types'

export function createNativeToken(chainId: ChainId) {
    return createFungibleToken<ChainId, SchemaType.Native>(
        chainId,
        SchemaType.Native,
        getTokenConstant(chainId, 'SOL_ADDRESS', ZERO_ADDRESS)!,
        'Solana',
        'SOL',
        9,
        'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    )
}
