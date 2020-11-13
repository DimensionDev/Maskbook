import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { Token, EthereumTokenType, ERC721Token } from '../types'
import { useChainId } from './useChainState'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useSingleContractMultipleData } from './useMulticall'

export function useERC721Token(token?: PartialRequired<Token, 'address' | 'type'>) {
    const chainId = useChainId()
    const erc721TokenContract = useERC721TokenContract(token?.address ?? '')

    // compose calls
    const { names, callDatas } = useMemo(
        () => ({
            names: ['name', 'symbol', 'baseURI'] as 'name'[],
            callDatas: new Array(3).fill([]),
        }),
        [],
    )

    // validate
    const [results, _, callback] = useSingleContractMultipleData(erc721TokenContract, names, callDatas)
    const asyncResult = useAsync(callback, [erc721TokenContract, names, callDatas])

    // compose
    const token_ = useMemo(() => {
        if (!erc721TokenContract || !token?.address || token.type !== EthereumTokenType.ERC721) return
        const [name = '', symbol = '', baseURI = ''] = results.map((x) => (x.error ? undefined : x.value))
        return {
            type: EthereumTokenType.ERC721,
            address: formatChecksumAddress(token.address),
            chainId,
            name,
            symbol,
            baseURI,
        } as ERC721Token
    }, [erc721TokenContract, token?.address, token?.type, chainId, results])
    return {
        ...asyncResult,
        value: token_,
    }
}
