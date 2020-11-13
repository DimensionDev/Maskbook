import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { Token, ERC20Token, EthereumTokenType } from '../types'
import { useChainId } from './useChainState'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { useSingleContractMultipleData } from './useMulticall'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'

export function useERC20Token(token?: PartialRequired<Token, 'address' | 'type'>) {
    const chainId = useChainId()
    const erc20TkenContract = useERC20TokenContract(token?.address ?? '')

    // compose calls
    const { names, callDatas } = useMemo(
        () => ({
            names: ['name', 'symbol', 'decimals'] as 'name'[],
            callDatas: [[], [], []] as [][],
        }),
        [],
    )

    // validate
    const [results, _, callback] = useSingleContractMultipleData(erc20TkenContract, names, callDatas)
    const asyncResult = useAsync(callback, [erc20TkenContract, names, callDatas])

    // compose
    const token_ = useMemo(() => {
        if (!erc20TkenContract || !token?.address || token.type !== EthereumTokenType.ERC20) return
        const [name = '', symbol = '', decimals = '0'] = results.map((x) => (x.error ? undefined : x.value))
        return {
            type: EthereumTokenType.ERC20,
            address: formatChecksumAddress(token.address),
            chainId,
            name,
            symbol,
            decimals: Number.parseInt(decimals, 10),
        } as ERC20Token
    }, [erc20TkenContract, token?.address, token?.type, chainId, results])
    return {
        ...asyncResult,
        value: token_,
    }
}
