import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import Fuse from 'fuse.js'
import { EthereumAddress } from 'wallet.ts'
import { useWeb3Context } from '../context'
import { useChainId } from './useChainId'
import { currySameAddress } from '../utils'
import type { ERC20TokenDetailed } from '../types'

export function useERC20TokensDetailedFromTokenLists(
    lists?: string[],
    keyword: string = '',
): AsyncStateRetry<ERC20TokenDetailed[]> {
    //#region fetch token lists
    const chainId = useChainId()
    const { fetchERC20TokensFromTokenLists } = useWeb3Context()
    const { value: allTokens = [], ...asyncResult } = useAsyncRetry(
        async () => (!lists || lists.length === 0 ? [] : fetchERC20TokensFromTokenLists(lists, chainId)),
        [chainId, lists?.sort().join()],
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

    if (!asyncResult.error)
        return {
            ...asyncResult,
            value: searchedTokens,
        }
    return {
        ...asyncResult,
        value: undefined,
    }
}
