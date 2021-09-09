import { unreachable } from '@dimensiondev/kit'
import { EthereumTokenType } from '../types'
import { useERC20TokenBalance } from './useERC20TokenBalance'
import { useNativeTokenBalance } from './useNativeTokenBalance'

export function useFungibleTokenBalance(type: EthereumTokenType.Native | EthereumTokenType.ERC20, address?: string) {
    const r1 = useNativeTokenBalance()
    const r2 = useERC20TokenBalance(type === EthereumTokenType.ERC20 ? address : undefined)

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
