import { useMemo } from 'react'
import { useAsync } from 'react-use'
import { Token, EthereumTokenType, ERC721Token } from '../types'
import { useChainId } from './useChainState'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useSingleContractMultipleData } from './useMulticall'

export function useERC721Token(token?: PartialRequired<Token, 'address' | 'type'>) {
    const chainId = useChainId()
    const erc721Contract = useERC721TokenContract(token?.address ?? '')
    const { names, callDatas } = useMemo(
        () => ({
            names: ['name', 'symbol', 'baseURI'] as 'name'[],
            callDatas: [[], [], []] as [][],
        }),
        [],
    )

    // validate
    const [results, _, callback] = useSingleContractMultipleData(erc721Contract, names, callDatas)
    useAsync(callback, [erc721Contract, names, callDatas])

    // compose result
    if (!erc721Contract) return
    if (!token?.address) return
    if (token.type !== EthereumTokenType.ERC721) return
    const [name = '', symbol = '', baseURI = ''] = results.map((x) => (x.error ? undefined : x.value))
    return {
        ...token,
        chainId,
        address: formatChecksumAddress(token.address),
        name,
        symbol,
        baseURI,
    } as ERC721Token
}
