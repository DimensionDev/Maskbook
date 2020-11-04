import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { EthereumTokenType, Token } from '../types'
import { useAccount } from './useAccount'
import { useSingleContractMultipleData } from './useMulticall'
import { useTokenBalance } from './useTokenBalance'

export function useERC721TokenIdsOfOwner(token?: PartialRequired<Token, 'address' | 'type'>) {
    const account = useAccount()
    const asyncResultOfBalanceOf = useTokenBalance(token)
    const erc721Contract = useERC721TokenContract(token?.address ?? '')
    const { names, callDatas } = useMemo(() => {
        const balanceOf = asyncResultOfBalanceOf.value ?? '0'
        return {
            names: new Array(Number.parseInt(balanceOf, 10)).fill('tokenOfOwnerByIndex') as 'tokenOfOwnerByIndex'[],
            callDatas: new Array(Number.parseInt(balanceOf, 10))
                .fill('')
                .map((_, i) => [account, i] as [string, number]),
        }
    }, [account, asyncResultOfBalanceOf.value])

    // valdiate callback
    const [results, _, callback] = useSingleContractMultipleData(erc721Contract, names, callDatas)
    const asyncResultOfMulticall = useAsyncRetry(callback, [names, callDatas])

    // compose result
    if (!erc721Contract || !token?.address || token.type !== EthereumTokenType.ERC721)
        return {
            loading: asyncResultOfBalanceOf.loading || asyncResultOfMulticall.loading,
            error: asyncResultOfBalanceOf.error || asyncResultOfMulticall,
            retry: asyncResultOfBalanceOf.retry,
            value: [],
        }
    return {
        loading: asyncResultOfBalanceOf.loading || asyncResultOfMulticall.loading,
        error: asyncResultOfBalanceOf.error || asyncResultOfMulticall,
        retry: asyncResultOfBalanceOf.retry,
        value: results.map((x) => x.value),
    }
}
