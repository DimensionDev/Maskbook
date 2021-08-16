import { useAsyncRetry } from 'react-use'
import type { ChainId, ERC721TokenAssetDetailed, ERC721TokenDetailed } from '../types'
import { useChainId } from './useChainId'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { createERC721Token, safeNonPayableTransactionCall } from '../utils'
import type { ERC721 } from '../../../web3-contracts/types/ERC721'
import { useMemo } from 'react'

export function useERC721TokenDetailed(address?: string, _token?: Partial<ERC721TokenDetailed>) {
    const chainId = useChainId()
    const token = useMemo(() => _token, [])
    const erc721TokenContract = useERC721TokenContract(address)
    return useAsyncRetry(async () => {
        if (!address) return
        return getERC721TokenDetailed(address, chainId, erc721TokenContract, token)
    }, [chainId, token, erc721TokenContract, address])
}

const lazyBlank = Promise.resolve('')

async function getERC721TokenDetailed(
    address: string,
    chainId: ChainId,
    erc721TokenContract: ERC721 | null,
    token?: Partial<ERC721TokenDetailed>,
) {
    const results = await Promise.allSettled([
        token?.name ?? safeNonPayableTransactionCall(erc721TokenContract?.methods.name()) ?? lazyBlank,
        token?.symbol ?? safeNonPayableTransactionCall(erc721TokenContract?.methods.symbol()) ?? lazyBlank,
        token?.baseURI ?? safeNonPayableTransactionCall(erc721TokenContract?.methods.baseURI()) ?? lazyBlank,
        token?.tokenURI ??
            (token?.tokenId
                ? safeNonPayableTransactionCall(erc721TokenContract?.methods.tokenURI(token.tokenId)) ?? lazyBlank
                : lazyBlank),
    ])
    const [name, symbol, baseURI, tokenURI] = results.map((result) =>
        result.status === 'fulfilled' ? result.value : '',
    ) as string[]
    const asset = await getERC721TokenAsset(tokenURI)
    return createERC721Token(chainId, token?.tokenId ?? '', address, name, symbol, baseURI, tokenURI, asset)
}

const BASE64_PREFIX = 'data:application/json;base64,'

async function getERC721TokenAsset(tokenURI?: string) {
    if (!tokenURI) return

    // for some NFT tokens retrun JSON in base64 encoded
    if (tokenURI.startsWith(BASE64_PREFIX))
        try {
            return JSON.parse(atob(tokenURI.replace(BASE64_PREFIX, ''))) as ERC721TokenAssetDetailed['asset']
        } catch (error) {
            void 0
        }

    // for some NFT tokens return JSON
    try {
        return JSON.parse(tokenURI) as ERC721TokenAssetDetailed['asset']
    } catch (error) {
        void 0
    }

    // for some NFT tokens return an URL refers to a JSON file
    try {
        const response = await fetch(tokenURI)
        return (await response.json()) as ERC721TokenAssetDetailed['asset']
    } catch (error) {
        void 0
    }

    return
}
