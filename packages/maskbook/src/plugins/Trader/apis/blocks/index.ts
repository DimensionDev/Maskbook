import stringify from 'json-stable-stringify'
import { getConstant } from '../../../../web3/helpers'
import { TRENDING_CONSTANTS } from '../../constants'
import { getChainId } from '../../../../extension/background-script/EthereumService'

async function fetchFromEthereumBlocksSubgraph<T>(query: string) {
    const response = await fetch(getConstant(TRENDING_CONSTANTS, 'ETHEREUM_BLOCKS_SUBGRAPH_URL', await getChainId()), {
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

/**
 * Fetches the block number near the given timestamp.
 * @param timestamp
 */
export async function fetchBlockNumberByTimestamp(timestamp: number) {
    const response = await fetchFromEthereumBlocksSubgraph<{
        number: string
    }>(`
    {
        blocks (
            first: 1,
            orderBy: timestamp,
            where: {
                timestamp_gt: ${timestamp},
                timestamp_lt: ${timestamp + 600}
            }
        ) {
            number
        }
    }
    `)
    return response.number
}

/**
 * Fetches block numbers near the given timestamps.
 * @param timestamps
 */
export async function fetchBlockNumbersByTimestamps(timestamps: number[]) {
    const queries = timestamps.map(
        (x) => `
        t${x}: blocks(
            first: 1,
            orderBy: timestamp,
            orderDirection: desc,
            where: {
                timestamp_gt: ${x},
                timestamp_lt: ${x + 600}
            }
        ) {
            number
        }
    `,
    )
    const response = await fetchFromEthereumBlocksSubgraph<{
        [key: string]: {
            number: string
        }[]
    }>(`
        query blocks {
            ${queries.join('\n')}
        }
    `)
    return Object.keys(response).map((x) => ({
        timestamp: x.slice(1),
        blockNumber: response[x][0].number,
    }))
}
