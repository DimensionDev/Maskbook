import { unreachable } from '@dimensiondev/kit'
import { Web3TokenType } from '@masknet/web3-shared-base'
import { useERC20TokenTransferCallback } from './useERC20TokenTransferCallback'
import { useERC721TokenTransferCallback } from './useERC721TokenTransferCallback'
import { useNativeTransferCallback } from './useNativeTokenTransferCallback'

export function useTokenTransferCallback(type: Web3TokenType, address: string) {
    const r1 = useNativeTransferCallback()
    const r2 = useERC20TokenTransferCallback(address)
    const r3 = useERC721TokenTransferCallback(address)
    const type_ = type
    switch (type_) {
        case Web3TokenType.Native:
            return r1
        case Web3TokenType.ERC20:
            return r2
        case Web3TokenType.ERC721:
            return r3
        default:
            unreachable(type_)
    }
}
