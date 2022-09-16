import { createNonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import type { MirrorBaseAPI, Writer } from '../types'

const MIRRORAPI_URL = 'https://mirror-api.com/graphql'

interface EntryRespnose {
    digest: string
    arweaveTransactionRequest: {
        transactionId: string
    }
    collaborators?: Writer[]
    publisher: {
        member: Writer
    }
    nft?: {
        tokenId?: string
        contributorAddress?: string
    }
    nftAddress?: string
    title: string
    body: string
    timestamp: number
}

async function fetchFromMirror<T>(query: string) {
    if (!query) return null
    const response = await fetch(MIRRORAPI_URL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({ query }),
    })
    const { data } = (await response.json()) as {
        data: T
    }
    return data
}
export class MirrorAPI implements MirrorBaseAPI.Provider {
    async getWriter(id: string) {
        if (!id) return null
        const writer = await fetchFromMirror<Writer>(`
            query Writer {
                projectFeed(projectAddress: ${id}) {
                    address
                    avatarURL
                    description
                    displayName
                    ens
                    domain
                }
            }
        `)

        return writer
    }

    async getPost(digest: string) {
        if (!digest) return null

        const response = await fetchFromMirror<EntryRespnose>(`
            query Entry() {
                entry(digest: ${digest}) {
                    digest
                    arweaveTransactionRequest {
                        transactionId
                    }
                    collaborators {
                            address
                            avatarURL
                            description
                            displayName
                            ens
                            domain
                    }
                    publisher {
                        member {
                            address
                            avatarURL
                            description
                            displayName
                            ens
                            domain
                        }
                        project {
                            address
                            avatarURL
                            description
                            displayName
                            ens
                            domain
                        }
                    }
                    nft {
                        tokenId
                        contributorAddress
                    }
                    nftAddress
                    title
                    body
                    timestamp
                }
            }
        `)
        if (!response) return null
        return {
            transactionId: response.arweaveTransactionRequest.transactionId,
            digest: response.digest,
            author: response.publisher.member,
            // TODO: chainId and schemaType
            token:
                response.nftAddress && response.nft?.tokenId
                    ? createNonFungibleToken(
                          ChainId.Mainnet,
                          response.nftAddress,
                          SchemaType.ERC721,
                          response.nft?.tokenId,
                          response.nft?.contributorAddress,
                      )
                    : undefined,
            content: {
                title: response.title,
                body: response.body,
                timestamp: response.timestamp,
            },
        }
    }
}
