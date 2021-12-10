import { useState, useCallback } from 'react'
import {
    getERC721TokenDetailedFromOpensea,
    getERC721TokenDetailedFromChain,
    getERC721TokenAssetFromChain,
} from './useERC721TokenDetailed'
import type { ERC721ContractDetailed, ERC721TokenDetailed } from '../types'
import { useOpenseaAPIConstants } from '../constants'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'

export function useERC721TokenDetailedCallback(contractDetailed: ERC721ContractDetailed | undefined) {
    const [tokenId, setTokenId] = useState('')
    const { GET_SINGLE_ASSET_URL } = useOpenseaAPIConstants()
    const erc721TokenContract = useERC721TokenContract(contractDetailed?.address ?? '')
    const erc721TokenDetailedCallback = useCallback(async () => {
        if (!erc721TokenContract || !contractDetailed || !tokenId) return
        let _tokenDetailedFromChain: ERC721TokenDetailed | undefined
        let tokenDetailedFromOpensea: ERC721TokenDetailed | null = null
        if (!GET_SINGLE_ASSET_URL) {
            _tokenDetailedFromChain = await getERC721TokenDetailedFromChain(
                contractDetailed,
                erc721TokenContract,
                tokenId,
            )
        } else {
            tokenDetailedFromOpensea = await getERC721TokenDetailedFromOpensea(
                contractDetailed,
                tokenId,
                GET_SINGLE_ASSET_URL,
            )
        }

        if (tokenDetailedFromOpensea) return tokenDetailedFromOpensea

        const tokenDetailedFromChain =
            _tokenDetailedFromChain ??
            (await getERC721TokenDetailedFromChain(contractDetailed, erc721TokenContract, tokenId))

        const info = await getERC721TokenAssetFromChain(tokenDetailedFromChain?.info.tokenURI)

        if (info && tokenDetailedFromChain) tokenDetailedFromChain.info = { ...info, ...tokenDetailedFromChain.info }

        return tokenDetailedFromChain
    }, [
        getERC721TokenDetailedFromOpensea,
        getERC721TokenDetailedFromChain,
        tokenId,
        contractDetailed,
        erc721TokenContract,
        GET_SINGLE_ASSET_URL,
    ])

    return [tokenId, setTokenId, erc721TokenDetailedCallback] as const
}
