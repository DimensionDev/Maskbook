import { useMemo } from 'react'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useChainId } from '../hooks/useChainState'
import { useSingleContractMultipleData } from '../hooks/useMulticall'
import { ERC721TokenDetailed, EthereumTokenType } from '../types'

let token_: ERC721TokenDetailed | undefined = undefined
async function ERC721TokenDetailed_(address: string, token?: Partial<ERC721TokenDetailed>) {
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
    const [results, _, callback] = useSingleContractMultipleData(erc721TokenContract, names, callDatas)

    await callback()
    // compose
    const [name, symbol, baseURI] = results.map((x) => (x.error ? undefined : x.value))
    token_ = {
        type: EthereumTokenType.ERC721,
        address: formatChecksumAddress(address),
        chainId,
        name: name ?? token?.name ?? '',
        symbol: symbol ?? token?.symbol ?? '',
        baseURI: baseURI ?? token?.baseURI ?? '',
    } as ERC721TokenDetailed

    return
}

export function getERC721TokenDetailed(address: string, token?: Partial<ERC721TokenDetailed>) {
    if (!token_) throw ERC721TokenDetailed_(address)
    return token_
}
