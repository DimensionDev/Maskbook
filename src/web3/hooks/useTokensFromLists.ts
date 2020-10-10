import { useMemo } from 'react'
import Fuse from 'fuse.js'
import Services from '../../extension/service'
import { useAsync } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { isSameAddress, createEetherToken } from '../helpers'
import { useChainId } from './useChainState'
import { EthereumTokenType, ChainId } from '../types'
import { useToken } from './useToken'

export enum TokenListsState {
    READY,
    LOADING_TOKEN_LISTS,
    LOADING_SEARCHED_TOKEN,
}

export function useTokensFromLists(
    lists: string[],
    {
        keyword = '',
        useEther = false,
        // TOOD:
        // to be implemented
        useAddressOnly = false,
    }: { keyword?: string; chainId?: ChainId; useEther?: boolean; useAddressOnly?: boolean } = {},
) {
    //#region fetch token lists
    const chainId = useChainId()
    const { value: allTokens = [], loading: loadingAllTokens } = useAsync(async () => {
        const tokens = lists.length === 0 ? [] : await Services.Ethereum.fetchTokensFromTokenLists(lists, chainId)
        return useEther ? [createEetherToken(chainId), ...tokens] : tokens
    }, [chainId, useEther, lists.sort().join()])
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
    }, [keyword, fuse, allTokens])
    //#endregion

    //#region add token by address
    const matchedToken = useMemo(() => {
        if (!keyword) return
        if (!EthereumAddress.isValid(keyword)) return
        if (searchedTokens.length) return
        return {
            type: EthereumTokenType.ERC20,
            address: keyword,
        }
    }, [keyword, searchedTokens.length])
    const { value: searchedToken, loading: loadingSearchedToken } = useToken(matchedToken)
    //#endregion

    return {
        state: loadingAllTokens
            ? TokenListsState.LOADING_TOKEN_LISTS
            : loadingSearchedToken
            ? TokenListsState.LOADING_SEARCHED_TOKEN
            : TokenListsState.READY,
        tokens: searchedTokens.length ? searchedTokens : searchedToken ? [searchedToken] : [],
    }
}
