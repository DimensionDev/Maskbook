import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { EthereumTokenType, ERC721TokenDetailed } from '../types'
import { useChainId } from './useChainState'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useSingleContractMultipleData } from './useMulticall'

export function useERC721TokenDetailed(address: string, token?: Partial<ERC721TokenDetailed>) {
    const chainId = useChainId()
    const erc721TokenContract = useERC721TokenContract(address)

    // compose calls
    const { names, callDatas } = useMemo(
        () => ({
            names: ['name', 'symbol', 'baseURI'] as 'name'[],
            callDatas: new Array(3).fill([]),
        }),
        [],
    )

    // validate
    const [results, calls, _, callback] = useSingleContractMultipleData(erc721TokenContract, names, callDatas)
    const asyncResult = useAsyncRetry(() => callback(calls), [erc721TokenContract, names, callDatas])

    // compose
    const token_ = useMemo(() => {
        if (!erc721TokenContract) return
        const [name, symbol, baseURI] = results.map((x) => (x.error ? undefined : x.value))
        return {
            type: EthereumTokenType.ERC721,
            address: formatChecksumAddress(address),
            chainId,
            name: name ?? token?.name ?? '',
            symbol: symbol ?? token?.symbol ?? '',
            baseURI: baseURI ?? token?.baseURI ?? '',
        } as ERC721TokenDetailed
    }, [erc721TokenContract, address, chainId, results, token?.name, token?.symbol, token?.baseURI])

    return {
        ...asyncResult,
        value: token_,
    } as AsyncStateRetry<typeof token_>
}
