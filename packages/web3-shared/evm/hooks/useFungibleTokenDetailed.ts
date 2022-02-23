import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { unreachable } from '@dimensiondev/kit'
import type { EthereumTokenDetailedType } from '../types'
import { Web3TokenType, ERC20TokenDetailed } from '@masknet/web3-shared-base'
import { useERC20TokenDetailed } from './useERC20TokenDetailed'
import { useNativeTokenDetailed } from './useNativeTokenDetailed'

export function useFungibleTokenDetailed<
    P extends EthereumTokenDetailedType<Web3TokenType.ERC20 | Web3TokenType.Native>,
>(
    type: Web3TokenType.ERC20 | Web3TokenType.Native,
    address: string,
    token?: Partial<P>,
): AsyncStateRetry<P | undefined> {
    const r1 = useNativeTokenDetailed()
    const r2 = useERC20TokenDetailed(
        type === Web3TokenType.ERC20 ? address : '',
        token as unknown as ERC20TokenDetailed,
    )
    switch (type) {
        case Web3TokenType.Native:
            return r1 as AsyncStateRetry<P | undefined>
        case Web3TokenType.ERC20:
            return r2 as AsyncStateRetry<P | undefined>
        default:
            unreachable(type)
    }
}
