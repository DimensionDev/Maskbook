import { resolveSubgraphLinkOnArtBlocks } from '../pipes'
import type { Project, Token } from '../types'

export async function fetchProject(chainId: number, projectId: string) {
    const body = {
        query: `query Project {
            projects(where: { projectId: "${projectId}"}) {
                id
                projectId
                active
                name
                description
                additionalPayee
                complete
                paused
                artistName
                artistAddress
                pricePerTokenInWei
                currencyAddress
                currencySymbol
                contract {
                    id
                }
                website
                license
                invocations
                maxInvocations
                scriptJSON
            }
        }`,
    }

    const response = await fetch(resolveSubgraphLinkOnArtBlocks(chainId), {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })

    const result = (await response.json())?.data

    return result as {
        projects: Project[]
    }
}

export async function fetchToken(chainId: number, tokenId: number) {
    const body = {
        query: `query Token {
            tokens(where: { tokenId: "${tokenId}"}) {
                tokenId
                contract {
                    id
                }
                project {
                    maxInvocations
                    projectId
                }
            }
        }`,
    }

    const response = await fetch(resolveSubgraphLinkOnArtBlocks(chainId), {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })

    const result = (await response.json())?.data

    return result as {
        tokens: Token[]
    }
}
