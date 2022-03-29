import { unreachable } from '@dimensiondev/kit'
import { ChainId, EthereumTokenType } from '../types'
import { useERC20TokenBalance } from './useERC20TokenBalance'
import { useNativeTokenBalance } from './useNativeTokenBalance'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

export function useFungibleTokenBalance(
    type: EthereumTokenType.Native | EthereumTokenType.ERC20,
    address?: string,
    chainId?: ChainId,
): AsyncStateRetry<string | undefined> {
    const r1 = useNativeTokenBalance(chainId)
    const r2 = useERC20TokenBalance(type === EthereumTokenType.ERC20 ? address : undefined, chainId)

    const type_ = type
    switch (type_) {
        case EthereumTokenType.Native:
            return r1
        case EthereumTokenType.ERC20:
            return r2
        default:
            unreachable(type_)
    }
}
