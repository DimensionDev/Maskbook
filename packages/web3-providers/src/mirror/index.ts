import formatDateTime from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import type { MirrorBaseAPI, Writer } from '../types'

const MIRROR_API_URL = 'https://mirror-api.com/graphql'

interface EntryResponse {
    digest: string
    arweaveTransactionRequest: {
        transactionId: string
    }
    collaborators?: Writer[]
    publisher: {
        member: Writer
        project: Writer
    }
    nft?: {
        tokenId?: string
        contributorAddress?: string
    }
    nftAddress?: string
    title: string
    body: string
    publishedAtTimestamp: number
    writingNFT: {
        name: string
        symbol?: string
        description: string
        proxyAddress: string
        quantity: number
        timestamp: number
        network: {
            chainId: number
        }
        media: {
            url: string
        }
    }
}

interface requestBody {
    query: string
    variables: Record<string, string>
    operationName: string
}

async function fetchFromMirror<T>(body: requestBody) {
    if (!body) return null
    const response = await globalThis.fetch(MIRROR_API_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const { data } = (await response.json()) as {
        data: T
    }
    return data
}
export class MirrorAPI implements MirrorBaseAPI.Provider {
    async getWriter(id: string) {
        if (!id) return null

        const writer = await fetchFromMirror<{ projectFeed: Writer }>({
            query: `query Writer ($projectAddress: String!) {
                projectFeed(projectAddress: $projectAddress) {
                    address
                    avatarURL
                    description
                    displayName
                    ens
                    domain
                }
            }`,
            variables: { projectAddress: id },
            operationName: 'Writer',
        })

        return writer?.projectFeed
    }

    async getPost(digest: string) {
        if (!digest) return null

        const response = await fetchFromMirror<{ entry: EntryResponse }>({
            query: `
            query Entry ($digest: String!) {
                entry(digest: $digest) {
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
                    publishedAtTimestamp
                    writingNFT {
                        name
                        network {
                            chainId
                            name
                        }
                        description
                        owner
                        proxyAddress
                        quantity
                        symbol
                        title
                        timestamp
                        media {
                            url
                        }
                    }
                }
            }
        `,
            variables: { digest },
            operationName: 'Entry',
        })
        if (!response) return null
        return {
            transactionId: response.entry.arweaveTransactionRequest.transactionId,
            digest: response.entry.digest,
            author: response.entry.publisher.project,
            coAuthors: [response.entry.publisher.member],
            collaborators: response.entry.collaborators,
            collection: {
                chainId: response.entry.writingNFT.network.chainId,
                name: response.entry.writingNFT.name,
                slug: response.entry.writingNFT.symbol || response.entry.writingNFT.name,
                symbol: response.entry.writingNFT.symbol,
                description: response.entry.writingNFT.description,
                address: response.entry.writingNFT.proxyAddress,
                tokensTotal: response.entry.writingNFT.quantity,
                iconURL: response.entry.writingNFT.media.url,
                createAt: response.entry.writingNFT.timestamp,
            },
            version: formatDateTime(fromUnixTime(response.entry.publishedAtTimestamp), 'mm-dd-yyyy'),
            content: {
                title: response.entry.title,
                body: response.entry.body,
                timestamp: response.entry.publishedAtTimestamp,
            },
        }
    }
}
