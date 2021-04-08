import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { isSameAddress } from '../helpers'
import { useAccount } from './useAccount'
import { useERC721TokenIdsOfOwner } from './useERC721TokensOfOwner'
import { useSingleContractMultipleData } from './useMulticall'

export function useERC721TokenIdsOfSpender(address: string, spender: string, tokenIds_: string[] = []) {
    const account = useAccount()
    const erc721Contract = useERC721TokenContract(address)
    const { value: tokenIds = tokenIds_ } = useERC721TokenIdsOfOwner(address, tokenIds_.length ? account : '')

    // parameters
    const { names, callDatas } = useMemo(() => {
        return {
            names: new Array(tokenIds.length).fill('getApproved') as 'getApproved'[],
            callDatas: tokenIds.map((x) => [x]) as [string | number][],
        }
    }, [tokenIds])

    // validate
    const [results, calls, _, callback] = useSingleContractMultipleData(erc721Contract, names, callDatas)
    const asyncResultOfMulticall = useAsyncRetry(() => callback(calls), [names, callDatas])

    // compose
    const filteredTokenIds = useMemo(() => {
        if (!erc721Contract) return []
        return tokenIds
            .map((tokenId, i) => {
                if (isSameAddress(results[i].value ?? '', spender)) return tokenId
                return ''
            })
            .filter(Boolean)
    }, [spender, tokenIds, results, erc721Contract])

    return {
        ...asyncResultOfMulticall,
        value: filteredTokenIds,
    }
}
