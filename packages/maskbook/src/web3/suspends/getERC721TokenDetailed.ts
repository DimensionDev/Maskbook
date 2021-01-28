import { formatChecksumAddress } from '../../plugins/Wallet/formatter'

import { ChainId, ERC721TokenDetailed, EthereumTokenType } from '../types'

const cache = new Map<string, ERC721TokenDetailed | undefined>()
async function getERC721TokenDetailed_(
    chainId: ChainId,
    address: string,
    results: any[],
    callback: (calls_: any[]) => Promise<void>,
    calls: any[],
    token?: Partial<ERC721TokenDetailed>,
) {
    await callback(calls)
    // compose
    const [name, symbol, baseURI] = results.map((x) => (x.error ? undefined : x.value))
    const token_ = {
        type: EthereumTokenType.ERC721,
        address: formatChecksumAddress(address),
        chainId,
        name: name ?? token?.name ?? '',
        symbol: symbol ?? token?.symbol ?? '',
        baseURI: baseURI ?? token?.baseURI ?? '',
    } as ERC721TokenDetailed

    if (!cache.has(address)) cache.set(address, token_)
}

export function getERC721TokenDetailed(
    chainId: ChainId,
    address: string,
    results: any[],
    callback: (calls_: any[]) => Promise<void>,
    calls: any[],
    token?: Partial<ERC721TokenDetailed>,
) {
    if (!cache.has(address)) throw getERC721TokenDetailed_(chainId, address, results, callback, calls, token)
    return cache.get(address)!
}
