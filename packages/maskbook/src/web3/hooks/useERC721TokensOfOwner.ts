import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useERC721TokenBalance } from './useERC721TokenBalance'
import { useSingleContractMultipleData } from './useMulticall'

export function useERC721TokenIdsOfOwner(address: string, owner: string) {
    const { value: balanceOf = '0' } = useERC721TokenBalance(address)
    const erc721Contract = useERC721TokenContract(address)

    // parameters
    const { names, callDatas } = useMemo(() => {
        const balanceOf_ = Number.parseInt(balanceOf, 10)
        return {
            names: new Array(balanceOf_).fill('tokenOfOwnerByIndex') as 'tokenOfOwnerByIndex'[],
            callDatas: new Array(balanceOf_).fill('').map((_, i) => [owner, i] as [string, number]),
        }
    }, [owner, balanceOf])

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
