import formatDateTime from 'date-fns/format'
import fromUnixTime from 'date-fns/fromUnixTime'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { MirrorBaseAPI, Publisher, Writer } from '../entry-types.js'
import { fetchJSON } from '../entry-helpers.js'

const MIRROR_API_URL = 'https://mirror-api.com/graphql'

interface EntryResponse {
    digest: string
    arweaveTransactionRequest: {
        transactionId: string
    }
    collaborators: Writer[]
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
    const { data } = await fetchJSON<{ data: T }>(MIRROR_API_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return data
}

export class MirrorAPI implements MirrorBaseAPI.Provider {
    async getPostPublisher(digest: string): Promise<Publisher | null> {
        const script = document.getElementById('__NEXT_DATA__')?.innerHTML
        const INIT_DATA = JSON.parse(script ?? '{}')

        function getAuthorDetail(address?: string) {
            const author = INIT_DATA?.props?.pageProps?.__APOLLO_STATE__?.[`ProjectType:${address}`]
            return {
                displayName: author?.displayName,
                avatarURL: author?.avatarURL,
                domain: author?.domain,
            }
        }

        const publisher = INIT_DATA?.props?.pageProps?.__APOLLO_STATE__?.[`entry:${digest}`]?.publisher
        const collaborators =
            INIT_DATA?.props?.pageProps?.__APOLLO_STATE__?.[`entry:${digest}`]?.collaborators ?? EMPTY_LIST

        if (!publisher && !collaborators.length) {
            // get publisher from api
            const post = await this.getPost(digest)
            if (!post) return null

            return {
                author: post.author,
                coAuthors: post.collaborators,
            }
        } else {
            // get publisher from local
            return {
                author: {
                    address: publisher?.member.__ref?.replace('ProjectType:', '') as string,
                    ...getAuthorDetail(publisher?.member?.__ref?.replace('ProjectType:', '') as string),
                },
                coAuthors: [
                    ...collaborators.map((x: any) => ({
                        address: x.__ref?.replace('ProjectType:', '') as string,
                        ...getAuthorDetail(x.__ref?.replace('ProjectType:', '') as string),
                    })),
                ].filter((x) => !!x.address),
            }
        }
    }
    async getWriter(id: string) {
        if (!id) return null

        const writer = await fetchFromMirror<{
            projectFeed: Writer
        }>({
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

        return writer?.projectFeed || null
    }

    async getPost(digest: string) {
        if (!digest) return null

        const response = await fetchFromMirror<{
            entry: EntryResponse
        }>({
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
            author: response.entry.publisher.member,
            collaborators: response.entry.collaborators ?? EMPTY_LIST,
            collection: {
                chainId: response.entry.writingNFT.network.chainId,
                name: response.entry.writingNFT.name,
                slug: response.entry.writingNFT.symbol || response.entry.writingNFT.name,
                symbol: response.entry.writingNFT.symbol,
                description: response.entry.writingNFT.description,
                address: response.entry.writingNFT.proxyAddress,
                balance: response.entry.writingNFT.quantity,
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

    // TODO: this user get from local, should as fallback when get from mirror api failed.
    // Should refactor it when use this method in the business case.
    async getUser(): Promise<Writer | null> {
        const script = document.getElementById('__NEXT_DATA__')?.innerHTML
        if (!script) return null
        const INIT_DATA = JSON.parse(script)
        if (!INIT_DATA) return null

        return INIT_DATA.props?.pageProps?.project as Writer
    }
}
