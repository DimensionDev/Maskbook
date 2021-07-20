import { currySameAddress, EthereumTokenType, useChainId, useERC20TokenDetailed } from '@masknet/web3-shared'
import Fuse from 'fuse.js'
import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import Services from '../../extension/service'

export enum TokenListsState {
    READY,
    LOADING_TOKEN_LISTS,
    LOADING_SEARCHED_TOKEN,
}

export function useERC20TokensDetailedFromTokenLists(lists: string[], keyword: string = '') {
    //#region fetch token lists
    const chainId = useChainId()
    const { value: allTokens = [], loading: loadingAllTokens } = useAsync(
        async () => (lists.length === 0 ? [] : Services.Ethereum.fetchERC20TokensFromTokenLists(lists, chainId)),
        [chainId, lists.sort().join()],
    )
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
            ...(EthereumAddress.isValid(keyword) ? allTokens.filter(currySameAddress(keyword)) : []),
            ...fuse.search(keyword).map((x) => x.item),
        ]
    }, [keyword, fuse, allTokens])
    //#endregion

    //#region add token by address
    const matchedToken = useMemo(() => {
        if (!keyword || !EthereumAddress.isValid(keyword) || searchedTokens.length) return
        return {
            type: EthereumTokenType.ERC20,
            address: keyword,
        }
    }, [keyword, searchedTokens.length])
    const { value: searchedToken, loading: loadingSearchedToken } = useERC20TokenDetailed(matchedToken?.address ?? '')
    //#endregion

    return {
        state: loadingAllTokens
            ? TokenListsState.LOADING_TOKEN_LISTS
            : loadingSearchedToken
            ? TokenListsState.LOADING_SEARCHED_TOKEN
            : TokenListsState.READY,
        tokensDetailed: searchedTokens.length ? searchedTokens : searchedToken ? [searchedToken] : [],
    }
}
