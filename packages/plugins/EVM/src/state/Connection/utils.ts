import type { TransactionReceipt } from 'web3-core'
import { NonFungibleTokenMetadata, TransactionStatusType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { noop } from 'lodash-unified'

export function getReceiptStatus(receipt: TransactionReceipt | null) {
    if (!receipt) return TransactionStatusType.NOT_DEPEND
    const status = receipt.status as unknown as string
    if (receipt.status === false || ['0', '0x', '0x0'].includes(status)) return TransactionStatusType.FAILED
    if (receipt.status === true || ['1', '0x1'].includes(status)) return TransactionStatusType.SUCCEED
    return TransactionStatusType.NOT_DEPEND
}

const assetCache: Record<string, Promise<NonFungibleTokenMetadata<ChainId>> | NonFungibleTokenMetadata<ChainId>> =
    Object.create(null)
const lazyVoid = Promise.resolve()

const BASE64_PREFIX = 'data:application/json;base64,'
const HTTP_PREFIX = 'http'
const CORS_PROXY = 'https://cors.r2d2.to'

export async function getERC721TokenAssetFromChain(
    tokenURI?: string,
): Promise<NonFungibleTokenMetadata<ChainId> | undefined> {
    if (!tokenURI) return
    if (assetCache[tokenURI]) return assetCache[tokenURI]

    let promise: Promise<NonFungibleTokenMetadata<ChainId> | void> = lazyVoid

    try {
        // for some NFT tokens return JSON in base64 encoded
        if (tokenURI.startsWith(BASE64_PREFIX)) {
            promise = Promise.resolve(
                JSON.parse(atob(tokenURI.replace(BASE64_PREFIX, ''))) as NonFungibleTokenMetadata<ChainId>,
            )
        } else {
            // for some NFT tokens return JSON
            promise = Promise.resolve(JSON.parse(tokenURI) as NonFungibleTokenMetadata<ChainId>)
        }
    } catch (error) {
        void 0
    }

    if (promise === lazyVoid) {
        try {
            // for some NFT tokens return an URL refers to a JSON file
            promise = globalThis
                .r2d2Fetch(tokenURI.startsWith(HTTP_PREFIX) ? `${CORS_PROXY}/?${tokenURI}` : tokenURI)
                .then(async (r) => {
                    const json = await r.json()
                    return {
                        ...json,
                        mediaUrl: json.image || json.animation_url,
                        imageURL: json.image || json.animation_url,
                    } as NonFungibleTokenMetadata<ChainId>
                }, noop)
            assetCache[tokenURI] = await (promise as Promise<NonFungibleTokenMetadata<ChainId>>)
            return assetCache[tokenURI]
        } catch (err) {
            return
        }
    }

    return
}
