import { useAsyncRetry } from 'react-use'
import { useRef } from 'react'
import urlcat from 'urlcat'
import { first, noop } from 'lodash-unified'
import type { ERC721ContractDetailed, ERC721TokenInfo, ERC721TokenDetailed } from '../types'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { safeNonPayableTransactionCall, createERC721Token, formatNFT_TokenId } from '../utils'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import { useOpenseaAPIConstants } from '../constants'

export function useERC721TokenDetailed(
    contractDetailed: ERC721ContractDetailed | undefined,
    tokenId: string | undefined,
) {
    const { GET_SINGLE_ASSET_URL } = useOpenseaAPIConstants()
    const erc721TokenContract = useERC721TokenContract(contractDetailed?.address ?? '')
    const tokenDetailedRef = useRef<ERC721TokenDetailed | undefined>()
    const asyncRetry = useAsyncRetry(async () => {
        if (!erc721TokenContract || !contractDetailed || !tokenId || !contractDetailed.address) return
        tokenDetailedRef.current = GET_SINGLE_ASSET_URL
            ? await getERC721TokenDetailedFromOpensea(contractDetailed, tokenId, GET_SINGLE_ASSET_URL)
            : await getERC721TokenDetailedFromChain(contractDetailed, erc721TokenContract, tokenId)
        const info = await getERC721TokenAssetFromChain(tokenDetailedRef.current?.info.tokenURI)

        if (info && tokenDetailedRef.current)
            tokenDetailedRef.current.info = {
                ...info,
                ...tokenDetailedRef.current.info,
                hasTokenDetailed: true,
                name: info.name ?? tokenDetailedRef.current.info.name,
            }
    }, [tokenId, JSON.stringify(contractDetailed), erc721TokenContract, GET_SINGLE_ASSET_URL])

    return { asyncRetry, tokenDetailed: tokenDetailedRef.current }
}

export async function getERC721TokenDetailedFromOpensea(
    contractDetailed: ERC721ContractDetailed,
    tokenId: string,
    apiUrl: string,
) {
    const response = await fetch(
        urlcat(`${apiUrl}/:address/:tokenId`, {
            address: contractDetailed.address,
            tokenId,
        }),
    )
    // https://docs.opensea.io/docs/metadata-standards
    type OpenseaTokenData = {
        name: string
        description: string
        image_url: string
        animation_url: string
        top_ownerships: { owner: { address: string } }[]
    }

    if (response.ok) {
        const data: OpenseaTokenData = await response.json()

        return createERC721Token(
            contractDetailed,
            {
                name: data.name,
                description: data.description,
                mediaUrl: data.image_url || data.animation_url,
                owner: first(data.top_ownerships)?.owner.address ?? '',
                hasTokenDetailed: true,
            },
            tokenId,
        )
    }
    return
}

export async function getERC721TokenDetailedFromChain(
    contractDetailed: ERC721ContractDetailed,
    erc721TokenContract: ERC721,
    tokenId: string,
    owner?: string,
    queryTokenURI = true,
) {
    if (!contractDetailed) return
    try {
        const tokenInfo = {
            owner: owner ?? (await safeNonPayableTransactionCall(erc721TokenContract.methods.ownerOf(tokenId))),
            tokenURI: queryTokenURI
                ? await safeNonPayableTransactionCall(erc721TokenContract.methods.tokenURI(tokenId))
                : '',
            name: formatNFT_TokenId(tokenId, 2),
            hasTokenDetailed: false,
        }
        return createERC721Token(contractDetailed, tokenInfo, tokenId)
    } catch (err) {
        return
    }
}

const assetCache: Record<string, Promise<ERC721TokenInfo> | ERC721TokenInfo> = Object.create(null)
const lazyVoid = Promise.resolve()

const BASE64_PREFIX = 'data:application/json;base64,'
const HTTP_PREFIX = 'http'
const CORS_PROXY = 'https://cors.r2d2.to'

export async function getERC721TokenAssetFromChain(tokenURI?: string): Promise<ERC721TokenInfo | void> {
    if (!tokenURI) return
    if (assetCache[tokenURI]) return assetCache[tokenURI]

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
        try {
            // for some NFT tokens return an URL refers to a JSON file
            promise = fetch(tokenURI.startsWith(HTTP_PREFIX) ? `${CORS_PROXY}/?${tokenURI}` : tokenURI).then(
                async (r) => {
                    const json = await r.json()
                    return {
                        ...json,
                        mediaUrl: json.image || json.animation_url,
                    } as ERC721TokenInfo
                },
                noop,
            )
            assetCache[tokenURI] = await (promise as Promise<ERC721TokenInfo>)
            return assetCache[tokenURI]
        } catch (err) {
            return
        }
    }

    return
}
