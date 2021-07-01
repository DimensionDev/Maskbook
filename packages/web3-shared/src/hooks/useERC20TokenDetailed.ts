import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { ERC20TokenDetailed, EthereumTokenType } from '../types'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useChainId } from './useChainId'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useERC20TokenBytes32Contract } from '../contracts/useERC20TokenBytes32Contract'
import { formatEthereumAddress, parseStringOrBytes32 } from '../utils'

export function useERC20TokenDetailed(address: string, token?: Partial<ERC20TokenDetailed>) {
    const chainId = useChainId()
    const erc20TokenContract = useERC20TokenContract(address)
    const erc20TokenBytes32Contract = useERC20TokenBytes32Contract(address)

    // name
    const { value: tokenName = token?.name ?? '', ...asyncTokenName } = useAsyncRetry(
        async () => token?.name ?? (await (erc20TokenContract?.methods.name().call() ?? '')),
        [erc20TokenContract],
    )
    const { value: tokenNameBytes32 = '', ...asyncTokenNameBytes32 } = useAsyncRetry(
        async () => await (erc20TokenBytes32Contract?.methods.name().call() ?? ''),
        [erc20TokenBytes32Contract],
    )

    // symbol
    const { value: tokenSymbol = token?.symbol ?? '', ...asyncTokenSymbol } = useAsyncRetry(
        async () => token?.symbol ?? (await (erc20TokenContract?.methods.symbol().call() ?? '')),
        [erc20TokenContract],
    )
    const { value: tokenSymbolBytes32 = '', ...asyncTokenSymbolBytes32 } = useAsyncRetry(
        async () => await (erc20TokenBytes32Contract?.methods.symbol().call() ?? ''),
        [erc20TokenBytes32Contract],
    )

    // decimals
    const { value: tokenDecimals = token?.decimals ?? '0', ...asyncTokenDecimals } = useAsyncRetry(
        async () => token?.decimals ?? (await (erc20TokenContract?.methods.decimals().call() ?? '0')),
        [erc20TokenContract],
    )

    // token detailed
    const tokenDetailed = useMemo(() => {
        return {
            type: EthereumTokenType.ERC20,
            address: formatEthereumAddress(address),
            chainId,
            symbol: parseStringOrBytes32(tokenSymbol, tokenSymbolBytes32, 'UNKNOWN'),
            name: parseStringOrBytes32(tokenName, tokenNameBytes32, 'Unknown Token'),
            decimals: typeof tokenDecimals === 'string' ? Number.parseInt(tokenDecimals, 10) : tokenDecimals,
        } as ERC20TokenDetailed
    }, [tokenName, tokenNameBytes32, tokenSymbol, tokenSymbolBytes32, tokenDecimals])

    const asyncList = [
        asyncTokenName,
        asyncTokenNameBytes32,
        asyncTokenSymbol,
        asyncTokenSymbolBytes32,
        asyncTokenDecimals,
    ]

    return {
        loading: asyncList.some((x) => x.loading),
        error: asyncList.find((x) => !!x.error)?.error ?? null,
        value: tokenDetailed,
    } as AsyncStateRetry<ERC20TokenDetailed>
}
