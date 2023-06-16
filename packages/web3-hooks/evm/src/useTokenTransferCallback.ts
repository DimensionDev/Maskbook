import { unreachable } from '@masknet/kit'
import { type ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useERC20TokenTransferCallback } from './useERC20TokenTransferCallback.js'
import { useERC721TokenTransferCallback } from './useERC721TokenTransferCallback.js'
import { useNativeTransferCallback } from './useNativeTokenTransferCallback.js'

export function useTokenTransferCallback(type: SchemaType, address: string, chainId?: ChainId) {
    const r1 = useNativeTransferCallback(chainId)
    const r2 = useERC20TokenTransferCallback(address, undefined, undefined, chainId)
    const r3 = useERC721TokenTransferCallback(address, chainId)
    const type_ = type
    switch (type_) {
        case SchemaType.Native:
            return r1
        case SchemaType.ERC20:
            return r2
        case SchemaType.SBT:
        case SchemaType.ERC721:
            return r3
        case SchemaType.ERC1155:
            throw new Error('Method not implemented.')
        default:
            unreachable(type_)
    }
}
