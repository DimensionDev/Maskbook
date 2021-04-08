import Fuse from 'fuse.js'
import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import Services from '../../extension/service'
import { isSameAddress } from '../helpers'
import { useChainId } from './useChainState'
import { EthereumTokenType, TokenDetailedType } from '../types'
import { useTokenDetailed } from './useTokenDetailed'
import { unreachable } from '../../utils/utils'

export enum TokenListsState {
    READY,
    LOADING_TOKEN_LISTS,
    LOADING_SEARCHED_TOKEN,
}

export function useTokensDetailedFromTokenLists(type: EthereumTokenType, lists: string[], keyword: string = '') {
    //#region fetch token lists
    const chainId = useChainId()
    const { value: allTokens_ = [], loading: loadingAllTokens } = useAsync(async () => {
        if (lists.length === 0) return []
        switch (type) {
            case EthereumTokenType.Ether:
                return []
            case EthereumTokenType.ERC20:
                return Services.Ethereum.fetchERC20TokensFromTokenLists(lists, chainId)
            case EthereumTokenType.ERC721:
                return Services.Ethereum.fetchERC721TokensFromTokenList(lists, chainId)
            case EthereumTokenType.ERC1155:
                return []
            default:
                unreachable(type)
        }
    }, [chainId, lists.sort().join()])
    const allTokens = allTokens_ as TokenDetailedType<EthereumTokenType>[]
    //#endregion

    //#region fuse
    const fuse = useMemo(
        () =>
            new Fuse(allTokens, {
                shouldSort: true,
                threshold: 0.45,
                minMatchCharLength: 1,
                keys: [
                    { name: 'name', weight: 0.5 },
                    { name: 'symbol', weight: 0.5 },
                ],
            }),
        [allTokens],
    )
    //#endregion

    //#region create searched tokens
    const searchedTokens = useMemo(() => {
        if (!keyword) return allTokens
        return [
            ...(EthereumAddress.isValid(keyword)
                ? allTokens.filter((token) => isSameAddress(token.address, keyword))
                : []),
            ...fuse.search(keyword).map((x) => x.item),
        ]
    }, [fuse, keyword, allTokens])
    //#endregion

    //#region add token by address
    const { value: searchedToken, loading: loadingSearchedToken } = useTokenDetailed(
        type,
        EthereumAddress.isValid(keyword) && !searchedTokens.length ? keyword : '',
    )
    //#endregion

    return {
        state: loadingAllTokens
            ? TokenListsState.LOADING_TOKEN_LISTS
            : loadingSearchedToken
            ? TokenListsState.LOADING_SEARCHED_TOKEN
            : TokenListsState.READY,
        tokensDetailed: [...searchedTokens, ...(searchedToken ? [searchedToken] : [])],
    }
}
