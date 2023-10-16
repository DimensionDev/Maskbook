import { fetchJSON } from '@masknet/web3-providers/helpers'
import { resolveSubgraphLinkOnArtBlocks } from '../pipes/index.js'

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
                currencyAddress
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

    const { data } = await fetchJSON<{ data: any }>(resolveSubgraphLinkOnArtBlocks(chainId), {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    return data
}
