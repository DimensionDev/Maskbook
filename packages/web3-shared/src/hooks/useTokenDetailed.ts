import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { unreachable } from '@dimensiondev/kit'
import { ERC20TokenDetailed, ERC721TokenDetailed, EthereumTokenDetailedType, EthereumTokenType } from '../types'
import { useERC20TokenDetailed } from './useERC20TokenDetailed'
import { useERC721TokenDetailed } from './useERC721TokenDetailed'
import { useNativeTokenDetailed } from './useNativeTokenDetailed'

export function useTokenDetailed<P extends EthereumTokenType, Q extends EthereumTokenDetailedType<P>>(
    type: P,
    address: string,
    token?: Partial<Q>,
): AsyncStateRetry<Q | undefined> {
    const r1 = useNativeTokenDetailed()
    const r2 = useERC20TokenDetailed(
        type === EthereumTokenType.ERC20 ? address : '',
        token as unknown as ERC20TokenDetailed,
    )
    const r3 = useERC721TokenDetailed(
        type === EthereumTokenType.ERC721 ? address : '',
        token as unknown as ERC721TokenDetailed,
    )

    const type_ = type as EthereumTokenType
    switch (type_) {
        case EthereumTokenType.Native:
            return r1 as AsyncStateRetry<Q | undefined>
        case EthereumTokenType.ERC20:
            return r2 as AsyncStateRetry<Q | undefined>
        case EthereumTokenType.ERC721:
            return r3 as AsyncStateRetry<Q | undefined>
        case EthereumTokenType.ERC1155:
            throw new Error('To be implemented')
        default:
            unreachable(type_)
    }
}
