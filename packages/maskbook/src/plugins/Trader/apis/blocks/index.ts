import { first } from 'lodash-es'
import stringify from 'json-stable-stringify'
import { getConstant } from '../../../../web3/helpers'
import { TRENDING_CONSTANTS } from '../../constants'
import { getChainId } from '../../../../extension/background-script/EthereumService'

interface Block {
    number: number
}

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
 * @param skipCount
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
        [key: string]: Block[]
    }>(`
        query blocks {
            ${queries.join('\n')}
        }
    `)
    return Object.keys(response)
        .filter((x) => response[x].length)
        .map((y) => ({
            timestamp: y.slice(1),
            blockNumber: response[y][0].number,
        }))
        .sort((a, z) => a.blockNumber - z.blockNumber)
}

/**
 * fetches block number near the given timestamp, the return will be a object, like { t{timestamp}: blockNumber }
 * the timestamps can't have too much item
 * @param timestamps
 */
export async function fetchBlockNumbersObjectByTimestamps(timestamps: number[]) {
    const queries = timestamps.map((x) => {
        // prettier-ignore
        return `
            t${x}: blocks(first: 1, orderBy: timestamp, where: { timestamp_gt: ${x}, timestamp_lt: ${x + 600} }) {
                number
            }
        `
    })

    const response = await fetchFromEthereumBlocksSubgraph<{
        [key: string]: Block[]
    }>(`
        query blocks {
            ${queries}
        }
    `)

    const result: { [key: string]: number | undefined } = {}
    Object.keys(response).map((key) => {
        result[key] = first(response[key])?.number
    })
    return result
}
