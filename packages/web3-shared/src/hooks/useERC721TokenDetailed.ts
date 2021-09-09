import { useAsyncRetry } from 'react-use'
import { noop } from 'lodash-es'
import type { ERC721ContractDetailed, ERC721TokenInfo } from '../types'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { safeNonPayableTransactionCall, createERC721Token } from '../utils'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { useOpenseaAPIConstants } from '../constants'

export function useERC721TokenDetailed(
    contractDetailed: ERC721ContractDetailed | undefined,
    tokenId: string | undefined,
) {
    const { GET_SINGLE_ASSET_URL } = useOpenseaAPIConstants()
    const erc721TokenContract = useERC721TokenContract(contractDetailed?.address ?? '')
    return useAsyncRetry(async () => {
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
    }, [erc721TokenContract, tokenId])
}

export async function getERC721TokenDetailedFromOpensea(
    contractDetailed: ERC721ContractDetailed,
    tokenId: string,
    apiUrl: string,
) {
    const response = await fetch(`${apiUrl}/${contractDetailed.address}/${tokenId}`)
    type openseaTokenData = {
        name: string
        description: string
        image_url: string
        top_ownerships: { owner: { address: string } }[]
    }

    if (response.ok) {
        const data: openseaTokenData = await response.json()

        return createERC721Token(
            contractDetailed,
            {
                name: data.name,
                description: data.description,
                image: data.image_url,
                owner: data.top_ownerships[0].owner.address,
            },
            tokenId,
        )
    }
    return null
}

export async function getERC721TokenDetailedFromChain(
    contractDetailed: ERC721ContractDetailed,
    erc721TokenContract: ERC721,
    tokenId: string,
) {
    if (!contractDetailed) return
    try {
        const tokenURI = await safeNonPayableTransactionCall(erc721TokenContract.methods.tokenURI(tokenId))
        const owner = await safeNonPayableTransactionCall(erc721TokenContract.methods.ownerOf(tokenId))
        const asset = await getERC721TokenAssetFromChain(tokenURI)
        const tokenInfo = { owner, ...asset }
        return createERC721Token(contractDetailed, tokenInfo, tokenId)
    } catch (err) {
        return
    }
}

const assetCache: Record<string, Promise<ERC721TokenInfo> | ERC721TokenInfo> = Object.create(null)
const lazyVoid = Promise.resolve()

const BASE64_PREFIX = 'data:application/json;base64,'
// Todo: replace this temporary proxy.
const CORS_PROXY = 'https://whispering-harbor-49523.herokuapp.com'
async function getERC721TokenAssetFromChain(tokenURI?: string): Promise<ERC721TokenInfo | void> {
    if (!tokenURI) return

    if (assetCache[tokenURI]) {
        return assetCache[tokenURI]
    }
    let promise: Promise<ERC721TokenInfo | void> = lazyVoid

    try {
        // for some NFT tokens return JSON in base64 encoded
        if (tokenURI.startsWith(BASE64_PREFIX)) {
            promise = Promise.resolve(JSON.parse(atob(tokenURI.replace(BASE64_PREFIX, ''))) as ERC721TokenInfo)
        } else {
            // for some NFT tokens return JSON
            promise = Promise.resolve(JSON.parse(tokenURI) as ERC721TokenInfo)
        }
    } catch (error) {
        void 0
    }

    if (promise === lazyVoid) {
        // for some NFT tokens return an URL refers to a JSON file
        promise = fetch(`${CORS_PROXY}/${tokenURI}`).then((r) => r.json() as ERC721TokenInfo, noop)
        assetCache[tokenURI] = promise as Promise<ERC721TokenInfo>
        const result = await promise
        assetCache[tokenURI] = result as ERC721TokenInfo
        return result
    }

    return
}
