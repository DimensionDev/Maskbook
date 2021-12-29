import stringify from 'json-stable-stringify'

async function fetchFromENSTextResolverSubgraph<T>(query: string) {
    const subgraphURL = 'https://api.thegraph.com/subgraphs/name/dimensiondev/ens-text-resolver-subgraph'
    const response = await fetch(subgraphURL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({ query }),
    })
    const { data } = (await response.json()) as {
        data: T
    }
    return data
}

export async function fetchAddressNamesByTwitterId(twitterId: string) {
    const data = await fetchFromENSTextResolverSubgraph<{
        twitterHandle?: {
            domains: {
                id: string
                owner: string
            }[]
        }
    }>(`
        query twitterHandle {
            twitterHandle(id: "${twitterId}") {
                id
                raw
                domains {
                    id
                    owner
                }
            }
        }
    `)
    if (!data?.twitterHandle) return []
    return data.twitterHandle.domains
}
