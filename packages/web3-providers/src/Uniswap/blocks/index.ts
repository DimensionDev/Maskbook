import { chunk, first, flatten } from 'lodash-es'
import stringify from 'json-stable-stringify'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type ChainId, getTrendingConstants } from '@masknet/web3-shared-evm'
import { fetchJSON } from '../../helpers/fetchJSON.js'

interface Block {
    number: string
}

async function fetchFromEthereumBlocksSubgraph<T>(chainId: Web3Helper.ChainIdAll, query: string) {
    const subgraphURL = getTrendingConstants(chainId).ETHEREUM_BLOCKS_SUBGRAPH_URL
    if (!subgraphURL) return null
    const { data } = await fetchJSON<{ data: T }>(subgraphURL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({ query }),
    })
    return data
}

/**
 * Fetches the block number near the given timestamp.
 * @param timestamp
 */
export async function fetchBlockNumberByTimestamp(chainId: Web3Helper.ChainIdAll, timestamp: number) {
    const data = await fetchFromEthereumBlocksSubgraph<{
        blocks: Block[]
    }>(
        chainId,
        `
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
    `,
    )
    return first(data?.blocks)?.number
}

/**
 * Fetches block numbers near the given timestamps.
 * @param timestamps
 * @param skipCount
 */
export async function fetchBlockNumbersByTimestamps(chainId: ChainId, timestamps: number[], skipCount = 100) {
    // avoiding request entity too large
    const chunkTimestamps = chunk(timestamps, skipCount)

    const data = await Promise.all(
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

            return fetchFromEthereumBlocksSubgraph<Record<string, Block[]>>(
                chainId,
                `
                query blocks {
                    ${queries}
                }
            `,
            )
        }),
    )

    return flatten(
        data.filter(Boolean).map((result) =>
            Object.keys(result!).map((x) => ({
                timestamp: Number(x.split('t')[1]),
                blockNumber: first(result![x])!.number,
            })),
        ),
    )
}

/**
 * fetches block number near the given timestamp, the return will be a object, like { t{timestamp}: blockNumber }
 * the timestamps can't have too much item
 * @param timestamps
 */
export async function fetchBlockNumbersObjectByTimestamps(chainId: Web3Helper.ChainIdAll, timestamps: number[]) {
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

    const data = await fetchFromEthereumBlocksSubgraph<Record<string, Block[]>>(
        chainId,
        `
        query blocks {
            ${queries}
        }
    `,
    )

    const result: Record<string, string | undefined> = {}
    if (!data) return result

    Object.keys(data).map((key) => {
        result[key] = first(data[key])?.number
    })

    return result
}