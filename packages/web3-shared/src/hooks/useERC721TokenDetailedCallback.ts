import { useState, useCallback } from 'react'
import { getERC721TokenDetailedFromOpensea, getERC721TokenDetailedFromChain } from './useERC721TokenDetailed'
import type { ERC721ContractDetailed } from '../types'
import { useOpenseaAPIConstants } from '../constants'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'

export function useERC721TokenDetailedCallback(contractDetailed: ERC721ContractDetailed | undefined) {
    const [tokenId, setTokenId] = useState('')
    const { GET_SINGLE_ASSET_URL } = useOpenseaAPIConstants()
    const erc721TokenContract = useERC721TokenContract(contractDetailed?.address ?? '')
    const erc721TokenDetailedCallback = useCallback(async () => {
        if (!erc721TokenContract || !contractDetailed || !tokenId) return
        if (!GET_SINGLE_ASSET_URL)
            return getERC721TokenDetailedFromChain(contractDetailed, erc721TokenContract, tokenId)

        const tokenDetailedFromOpensea = await getERC721TokenDetailedFromOpensea(
            contractDetailed,
            tokenId,
            GET_SINGLE_ASSET_URL,
        )

        return (
            tokenDetailedFromOpensea ?? getERC721TokenDetailedFromChain(contractDetailed, erc721TokenContract, tokenId)
        )
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
