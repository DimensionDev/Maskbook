import { unreachable } from '@dimensiondev/kit'
import type { ChainId } from '../types'
import { Web3TokenType } from '@masknet/web3-shared-base'
import { useERC20TokenBalance } from './useERC20TokenBalance'
import { useNativeTokenBalance } from './useNativeTokenBalance'

export function useFungibleTokenBalance(
    type: Web3TokenType.Native | Web3TokenType.ERC20,
    address?: string,
    chainId?: ChainId,
) {
    const r1 = useNativeTokenBalance(chainId)
    const r2 = useERC20TokenBalance(type === Web3TokenType.ERC20 ? address : undefined, chainId)

    const type_ = type
    switch (type_) {
        case Web3TokenType.Native:
            return r1
        case Web3TokenType.ERC20:
            return r2
        default:
            unreachable(type_)
    }
}
