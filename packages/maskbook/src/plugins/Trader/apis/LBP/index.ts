import stringify from 'json-stable-stringify'
import { getChainId } from '../../../../extension/background-script/EthereumService'
import { getConstant } from '../../../../web3/helpers'
import { LBP_CONSTANTS } from '../../constants/LBP'

async function fetchFromBalancerPoolSubgraph<T>(query: string) {
    const response = await fetch(getConstant(LBP_CONSTANTS, 'BALANCER_POOLS_SUBGRAPH_URL', await getChainId()), {
        method: 'POST',
        mode: 'cors',
        body: stringify({
            query,
        }),
    })
    const { data } = (await response.json()) as {
        data: T
    }
    return data
}

export async function fetchPoolsByTokenAddress(address: string) {
    const response = await fetchFromBalancerPoolSubgraph<{
        pools: {
            id: string
            swapsCount: number
            tokensList: string[]
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
          swapsCount
          tokensList
        }
    }`)
    const { pools } = response
    if (!pools) throw new Error('Failed to load pools.')
    return pools
}

export async function fetchPoolTokenPrices(poolId: string, address: string, blockNumbers: string[]) {
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
            price: number
        }[]
    }>(`
        query tokenPrices {
            ${queries.join('\n')}
        }
    `)
    return Object.keys(response)
        .map((x) => ({
            price: response[x][0]?.price ?? 0,
            blockNumber: x.slice(1),
        }))
        .sort((a, z) => (Number.parseInt(a.blockNumber) > Number.parseInt(z.blockNumber) ? 1 : -1))
}
