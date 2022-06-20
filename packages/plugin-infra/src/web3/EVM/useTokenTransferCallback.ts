import { unreachable } from '@dimensiondev/kit'
import { SchemaType } from '@masknet/web3-shared-evm'
import { useERC20TokenTransferCallback } from './useERC20TokenTransferCallback'
import { useERC721TokenTransferCallback } from './useERC721TokenTransferCallback'
import { useNativeTransferCallback } from './useNativeTokenTransferCallback'

export function useTokenTransferCallback(type: SchemaType, address: string) {
    const r1 = useNativeTransferCallback()
    const r2 = useERC20TokenTransferCallback(address)
    const r3 = useERC721TokenTransferCallback(address)
    const type_ = type
    switch (type_) {
        case SchemaType.Native:
            return r1
        case SchemaType.ERC20:
            return r2
        case SchemaType.ERC721:
            return r3
        case SchemaType.ERC1155:
            throw new Error('To be implemented.')
        default:
            unreachable(type_)
    }
}
