import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { ERC721Token } from '../types'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useAccount } from './useAccount'
import { useERC721TokenBalance } from './useERC721TokenBalance'
import { useSingleContractMultipleData } from './useMulticall'

export function useERC721TokenIdsOfOwner(token?: ERC721Token) {
    const account = useAccount()
    const asyncResultOfBalanceOf = useERC721TokenBalance(token?.address ?? '')
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

    // valdiate
    const [results, calls, _, callback] = useSingleContractMultipleData(erc721Contract, names, callDatas)
    const asyncResultOfMulticall = useAsyncRetry(() => callback(calls), [names, callDatas])

    // compose
    const tokenIds = useMemo(() => {
        if (!erc721Contract) return []
        return results.filter((x) => !x.error).map((x) => x.value) as string[]
    }, [erc721Contract, results])

    return {
        ...asyncResultOfMulticall,
        value: tokenIds,
    }
}
