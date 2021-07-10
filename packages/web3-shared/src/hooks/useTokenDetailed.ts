import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { unreachable } from '@dimensiondev/kit'
import {
    ERC20TokenDetailed,
    ERC721TokenDetailed,
    FungibleTokenDetailed,
    EthereumTokenDetailedType,
    LoadingFailTokenDetailed,
    FungibleToken,
    NativeToken,
    EthereumTokenType,
    ERC20Token,
} from '../types'
import { useERC20TokenDetailed, useERC20TokensDetailed } from './useERC20TokenDetailed'
import { useERC721TokenDetailed } from './useERC721TokenDetailed'
import { useNativeTokenDetailed, useNativeTokensDetailed } from './useNativeTokenDetailed'

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

export function useFungibleTokensDetailed(listOfToken: Pick<FungibleToken, 'address' | 'type'>[]) {
    const nativeTokenOrders: number[] = []
    const listOfNativeToken = listOfToken.filter((t, i) => {
        if (t.type === EthereumTokenType.Native) {
            nativeTokenOrders.push(i)
            return true
        }
        return false
    })
    const listOfERC20Token = listOfToken.filter((t) => t.type === EthereumTokenType.ERC20)

    const { value: nativeTokensDetailed = [], ...asyncNativeResult } = useNativeTokensDetailed(
        listOfNativeToken as Pick<NativeToken, 'type' | 'address'>[],
    )
    const { value: erc20TokensDetailed = [], ...asyncErc20Result } = useERC20TokensDetailed(
        listOfERC20Token as Pick<ERC20Token, 'type' | 'address'>[],
    )

    const asyncList = [asyncNativeResult, asyncErc20Result]

    const tokensDetailed = erc20TokensDetailed

    nativeTokenOrders.forEach((order, i) => tokensDetailed.splice(order, 0, nativeTokensDetailed[i]))

    return {
        value: tokensDetailed,
        loading: asyncList.some((x) => x.loading),
        error: asyncList.find((x) => !!x.error)?.error ?? null,
    } as AsyncStateRetry<(FungibleTokenDetailed | LoadingFailTokenDetailed)[]>
}
