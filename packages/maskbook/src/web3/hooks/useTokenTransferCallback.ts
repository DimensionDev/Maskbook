import { unreachable } from '../../utils/utils'
import { EthereumTokenType } from '../types'
import { useERC20TokenTransferCallback } from './useERC20TokenTransferCallback'
import { useERC721TokenTransferCallback } from './useERC721TokenTransferCallback'
import { useEtherTransferCallback } from './useEtherTransferCallback'

export function useTokenTransferCallback(
    type: EthereumTokenType,
    address: string,
    amountOrTokenId: string,
    recipient: string,
    memo?: string,
) {
    const r1 = useEtherTransferCallback(type === EthereumTokenType.Ether ? amountOrTokenId : '', recipient, memo)
    const r2 = useERC20TokenTransferCallback(
        address,
        type === EthereumTokenType.ERC20 ? amountOrTokenId : '',
        recipient,
    )
    const r3 = useERC721TokenTransferCallback(
        address,
        type === EthereumTokenType.ERC721 ? amountOrTokenId : '',
        recipient,
    )
    const type_ = type
    switch (type_) {
        case EthereumTokenType.Ether:
            return r1
        case EthereumTokenType.ERC20:
            return r2
        case EthereumTokenType.ERC721:
            return r3
        default:
            unreachable(type_)
    }
}
