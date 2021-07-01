import {
    ERC1155TokenAssetDetailed,
    ERC721TokenAssetDetailed,
    EthereumTokenType,
    NonFungibleTokenDetailed,
} from '../types'
import { useERC721TokenAssetDetailed } from './useERC721TokenAssetDetailed'
import { useERC1155TokenAssetDetailed } from './useERC1155TokenAssetDetailed'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { unreachable } from '@dimensiondev/kit'

export function useTokenAssetDetailed(token?: NonFungibleTokenDetailed) {
    const r1 = useERC721TokenAssetDetailed(token?.type === EthereumTokenType.ERC721 ? token : undefined)
    const r2 = useERC1155TokenAssetDetailed(token?.type === EthereumTokenType.ERC1155 ? token : undefined)

    const type = token?.type ?? EthereumTokenType.ERC721
    switch (type) {
        case EthereumTokenType.ERC721:
            return r1 as AsyncStateRetry<ERC721TokenAssetDetailed | undefined>
        case EthereumTokenType.ERC1155:
            return r2 as AsyncStateRetry<ERC1155TokenAssetDetailed | undefined>
        default:
            unreachable(type)
    }
}
