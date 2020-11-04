import { useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { Token, EthereumTokenType } from '../types'
import { useChainId } from './useChainState'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useSingleContractMultipleData } from './useMulticall'

export function useERC20Token(token?: PartialRequired<Token, 'address' | 'type'>) {
    const chainId = useChainId()
    const erc721Contract = useERC721TokenContract(token?.address ?? '')
    const { names, callDatas } = useMemo(
        () => ({
            names: ['name', 'symbol', 'baseURI'] as 'name'[],
            callDatas: [[], [], []] as [][],
        }),
        [],
    )
    const [results, _, callback] = useSingleContractMultipleData(erc721Contract, names, callDatas)

    return useAsyncRetry(async () => {
        if (!erc721Contract) return
        if (!token?.address) return
        if (token.type !== EthereumTokenType.ERC721) return
        const [name = '', symbol = '', baseURI = ''] = results.map((x) => (x.error ? undefined : x.value))

        return {
            chainId,
            address: formatChecksumAddress(token.address),
            name,
            symbol,
            baseURI,
        }
    }, [chainId, token?.type, token?.address, erc721Contract])
}
