import { unreachable } from '../../utils/utils'
import { EthereumTokenType } from '../types'
import { useERC20TokenBalance } from './useERC20TokenBalance'
import { useERC721TokenBalance } from './useERC721TokenBalance'
import { useEtherTokenBalance } from './useEtherTokenBalance'

export function useTokenBalance(type: EthereumTokenType, address: string) {
    const r1 = useEtherTokenBalance(type === EthereumTokenType.Ether ? address : '')
    const r2 = useERC20TokenBalance(type === EthereumTokenType.ERC20 ? address : '')
    const r3 = useERC721TokenBalance(type === EthereumTokenType.ERC721 ? address : '')
    const type_ = type
    switch (type_) {
        case EthereumTokenType.Ether:
            return r1
        case EthereumTokenType.ERC20:
            return r2
        case EthereumTokenType.ERC721:
            return r3
        case EthereumTokenType.ERC1155:
            throw new Error('To be implemented')
        default:
            unreachable(type_)
    }
}
