import { useAsyncRetry } from 'react-use'
import type { ERC721ContractDetailed, ERC721TokenInfo } from '../types'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { safeNonPayableTransactionCall, createERC721Token } from '../utils'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'

export function useERC721TokenDetailed(
    contractDetailed: ERC721ContractDetailed | undefined,
    tokenId: string | undefined,
) {
    const erc721TokenContract = useERC721TokenContract(contractDetailed?.address ?? '')
    return useAsyncRetry(async () => {
        if (!erc721TokenContract || !contractDetailed || !tokenId) return
        return getERC721TokenDetailed(contractDetailed, erc721TokenContract, tokenId)
    }, [erc721TokenContract, tokenId])
}

async function getERC721TokenDetailed(
    contractDetailed: ERC721ContractDetailed | undefined,
    erc721TokenContract: ERC721,
    tokenId: string,
) {
    if (!contractDetailed) return
    const tokenURI = await safeNonPayableTransactionCall(erc721TokenContract.methods.tokenURI(tokenId))
    const asset = await getERC721TokenAsset(tokenURI)
    return createERC721Token(contractDetailed, asset ?? {}, tokenId)
}

const BASE64_PREFIX = 'data:application/json;base64,'
const CORS_PROXY = 'https://whispering-harbor-49523.herokuapp.com'
async function getERC721TokenAsset(tokenURI?: string) {
    if (!tokenURI) return

    // for some NFT tokens retrun JSON in base64 encoded
    if (tokenURI.startsWith(BASE64_PREFIX))
        try {
            return JSON.parse(atob(tokenURI.replace(BASE64_PREFIX, ''))) as ERC721TokenInfo
        } catch (error) {
            void 0
        }

    // for some NFT tokens return JSON
    try {
        return JSON.parse(tokenURI) as ERC721TokenInfo
    } catch (error) {
        void 0
    }

    // for some NFT tokens return an URL refers to a JSON file
    try {
        const response = await fetch(`${CORS_PROXY}/${tokenURI}`)
        const r = await response.json()
        console.log({ r })
        return r as ERC721TokenInfo
    } catch (error) {
        void 0
    }

    return
}
