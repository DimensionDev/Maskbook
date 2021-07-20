import { getTrendingConstants } from '@masknet/web3-shared'
import stringify from 'json-stable-stringify'
import { chunk, first, flatten } from 'lodash-es'
import { currentChainIdSettings } from '../../../Wallet/settings'

interface Block {
    number: string
}

async function fetchFromEthereumBlocksSubgraph<T>(query: string) {
    const response = await fetch(getTrendingConstants(currentChainIdSettings.value).ETHEREUM_BLOCKS_SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({ query }),
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
        blocks: Block[]
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
    return first(response.blocks)?.number
}

/**
 * Fetches block numbers near the given timestamps.
 * @param timestamps
 * @param skipCount
 */
export async function fetchBlockNumbersByTimestamps(timestamps: number[], skipCount = 100) {
    // avoiding request entity too large
    const chunkTimestamps = chunk(timestamps, skipCount)

    const response = await Promise.all(
        chunkTimestamps.map(async (chunk) => {
            const queries = chunk.map((x) => {
                return `
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
                `
            })

            return fetchFromEthereumBlocksSubgraph<{
                [key: string]: Block[]
            }>(`
                query blocks {
                    ${queries}
                }
            `)
        }),
    )

    return flatten(
        response.map((result) =>
            Object.keys(result).map((x) => ({
                timestamp: Number(x.split('t')[1]),
                // @ts-ignore
                blockNumber: first(result[x])!.number,
            })),
        ),
    )
}

/**
 * fetches block number near the given timestamp, the return will be a object, like { t{timestamp}: blockNumber }
 * the timestamps can't have too much item
 * @param timestamps
 */
export async function fetchBlockNumbersObjectByTimestamps(timestamps: number[]) {
    const queries = timestamps.map((x) => {
        return `
            t${x}: blocks(
                first: 1,
                orderBy: timestamp,
                where: {
                    timestamp_gt: ${x},
                    timestamp_lt: ${x + 600}
                }
            ) {
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

    const result: { [key: string]: string | undefined } = {}

    Object.keys(response).map((key) => {
        result[key] = first(response[key])?.number
    })

    return result
}
