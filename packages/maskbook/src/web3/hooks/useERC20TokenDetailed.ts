import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { EthereumTokenType, ERC20TokenDetailed } from '../types'
import { useChainId } from './useChainState'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { useSingleContractMultipleData } from './useMulticall'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'

export function useERC20TokenDetailed(address: string, token?: Partial<ERC20TokenDetailed>) {
    const chainId = useChainId()
    const erc20TokenContract = useERC20TokenContract(address)

    // compose calls
    const { names, callDatas } = useMemo(
        () => ({
            names: ['name', 'symbol', 'decimals'] as 'name'[],
            callDatas: [[], [], []] as [][],
        }),
        [],
    )

    // validate
    const [results, calls, _, callback] = useSingleContractMultipleData(erc20TokenContract, names, callDatas)
    const asyncResult = useAsyncRetry(() => callback(calls), [calls, callback])

    // compose
    const token_ = useMemo(() => {
        if (!erc20TokenContract) return
        const [name, symbol, decimals] = results.map((x) => (x.error ? undefined : x.value))
        // not a valid erc20 token
        if (!name && !symbol && !decimals) return
        return {
            type: EthereumTokenType.ERC20,
            address: formatChecksumAddress(address),
            chainId,
            name: name ?? token?.name ?? '',
            symbol: symbol ?? token?.symbol ?? '',
            decimals: decimals ? Number.parseInt(decimals, 10) : token?.decimals ?? 0,
        } as ERC20TokenDetailed
    }, [erc20TokenContract, address, chainId, results, token])

    return {
        ...asyncResult,
        value: token_,
    } as AsyncStateRetry<typeof token_>
}
