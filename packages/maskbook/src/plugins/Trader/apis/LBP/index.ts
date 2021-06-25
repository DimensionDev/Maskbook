import { getLBPConstants } from '@masknet/web3-shared'
import stringify from 'json-stable-stringify'
import { currentChainIdSettings } from '../../../Wallet/settings'

async function fetchFromBalancerPoolSubgraph<T>(query: string) {
    const response = await fetch(getLBPConstants(currentChainIdSettings.value).BALANCER_POOLS_SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({ query }),
    })
    const { data } = (await response.json()) as {
        data: T
    }
    return data
}

export async function fetchLBP_PoolsByTokenAddress(address: string) {
    const response = await fetchFromBalancerPoolSubgraph<{
        pools: {
            id: string
            createTime: number
        }[]
    }>(`
    {
        pools(
            orderBy: swapsCount,
            orderDirection: desc,
            where: {
                rights_contains: ["canChangeWeights"],
                tokensList_contains: ["${address.toLowerCase()}"]
            }
        ) {
          id
          createTime
        }
    }`)
    const { pools } = response
    if (!pools) throw new Error('Failed to load pools.')
    return pools
}

export async function fetchLBP_PoolTokenPrices(poolId: string, address: string, blockNumbers: string[]) {
    const queries = blockNumbers.map(
        (x) => `
        b${x}: tokenPrices (
            where: { poolTokenId: "${poolId.toLowerCase()}-${address.toLowerCase()}" },
            block: {
                number: ${x}
            }
        ) {
            price
        }
    `,
    )
    const response = await fetchFromBalancerPoolSubgraph<{
        [key: string]: {
            price: string
        }[]
    }>(`
        query tokenPrices {
            ${queries.join('\n')}
        }
    `)
    return Object.keys(response)
        .map((x) => ({
            price: response[x][0]?.price ?? '0',
            blockNumber: x.slice(1),
        }))
        .sort((a, z) => Number.parseInt(a.blockNumber) - Number.parseInt(z.blockNumber))
}

export async function fetchLBP_PoolTokens(poolId: string, blockNumbers: string[]) {
    const queries = blockNumbers.map(
        (x) => `
        b${x}: pools (
            where: {
                id: "${poolId.toLowerCase()}"
            },
            block: {
                number: ${x}
            }
        ) {
            tokens {
                address
                balance
                denormWeight
            }
        }`,
    )
    const response = await fetchFromBalancerPoolSubgraph<{
        [key: string]: {
            tokens: {
                address: string
                balance: string
                denormWeight: string
            }[]
        }
    }>(`
        query poolTokens {
            ${queries.join('\n')}
        }
    `)
    return Object.keys(response).map((x) => ({
        tokens: response[x].tokens,
        blockNumber: x.slice(1),
    }))
}
