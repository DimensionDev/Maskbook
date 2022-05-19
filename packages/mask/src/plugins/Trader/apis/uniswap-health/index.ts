import { ChainId, getTrendingConstants } from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import { first } from 'lodash-unified'

async function fetchFromUniswapV2Health<T>(chainId: ChainId, query: string) {
    const subgraphURL = getTrendingConstants(chainId).UNISWAP_V2_HEALTH_URL
    if (!subgraphURL) return null
    const response = await fetch(subgraphURL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({ query }),
    })

    const { data } = (await response.json()) as { data: T }
    return data
}

export async function fetchLatestBlocks(chainId: ChainId) {
    type status = {
        synced: string
        health: string
        chains: {
            chainHeadBlock: {
                number: number
            }
            latestBlock: {
                number: number
            }
        }[]
    }
    const response = await fetchFromUniswapV2Health<{
        indexingStatusForCurrentVersion: status
    }>(
        chainId,
        `
      query health {
        indexingStatusForCurrentVersion(subgraphName: "uniswap/uniswap-v2") {
          synced
          health
          chains {
            chainHeadBlock {
              number
            }
            latestBlock {
              number
            }
          }
        }
      }
    `,
    )

    const latestBlock = first(response?.indexingStatusForCurrentVersion.chains)?.latestBlock.number
    const headBlock = first(response?.indexingStatusForCurrentVersion.chains)?.chainHeadBlock.number

    return [latestBlock, headBlock]
}
