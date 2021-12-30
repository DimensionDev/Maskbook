import { getLBPConstants } from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import { currentChainIdSettings } from '../../../Wallet/settings'

async function fetchFromBalancerPoolSubgraph<T>(query: string) {
    const subgraphURL = getLBPConstants(currentChainIdSettings.value).BALANCER_POOLS_SUBGRAPH_URL
    if (!subgraphURL) return null
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

export async function fetchLBP_PoolsByTokenAddress(address: string) {
    const data = await fetchFromBalancerPoolSubgraph<{
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
    if (!data?.pools) throw new Error('Failed to load pools.')
    return data.pools
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
    const data = await fetchFromBalancerPoolSubgraph<Record<string, { price: string }[]>>(`
        query tokenPrices {
            ${queries.join('\n')}
        }
    `)
    if (!data) return []
    return Object.keys(data)
        .map((x) => ({
            price: data[x][0]?.price ?? '0',
            blockNumber: x.slice(1),
        }))
        .sort((a, z) => Number.parseInt(a.blockNumber, 10) - Number.parseInt(z.blockNumber, 10))
}

interface LBPPoolToken {
    address: string
    balance: string
    denormWeight: string
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

    const data = await fetchFromBalancerPoolSubgraph<Record<string, { tokens: LBPPoolToken[] }>>(`
        query poolTokens {
            ${queries.join('\n')}
        }
    `)
    if (!data) return []
    return Object.keys(data).map((x) => ({
        tokens: data[x].tokens,
        blockNumber: x.slice(1),
    }))
}
