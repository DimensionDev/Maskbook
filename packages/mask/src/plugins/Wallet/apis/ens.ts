import stringify from 'json-stable-stringify'

const subgraphURL = 'https://api.thegraph.com/subgraphs/name/dimensiondev/ens-text-resolver-subgraph'
const TIMEOUT = 3000
async function fetchFromENSTextResolverSubgraph<T>(query: string) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    const response = await fetch(subgraphURL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({ query }),
        signal: controller.signal,
    })
    clearTimeout(timer)
    const { data } = (await response.json()) as {
        data: T
    }
    return data
}

export async function fetchAddressNamesByTwitterId(twitterId: string) {
    if (!twitterId) return []
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
