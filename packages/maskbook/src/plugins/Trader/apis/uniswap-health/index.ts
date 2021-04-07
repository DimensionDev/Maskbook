import { getConstant } from '../../../../web3/helpers'
import { TRENDING_CONSTANTS } from '../../constants'
import { getChainId } from '../../../../extension/background-script/EthereumServices/chainState'
import stringify from 'json-stable-stringify'
import { first } from 'lodash-es'

async function fetchFromUniswapV2Health<T>(query: string) {
    const response = await fetch(getConstant(TRENDING_CONSTANTS, 'UNISWAP_V2_HEALTH_URL', await getChainId()), {
        method: 'POST',
        mode: 'cors',
        body: stringify({
            query,
        }),
    })

    const { data } = (await response.json()) as { data: T }
    return data
}

export async function fetchLatestBlocks() {
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
    }>(`
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
    `)

    const latestBlock = first(response.indexingStatusForCurrentVersion.chains)?.latestBlock.number
    const headBlock = first(response.indexingStatusForCurrentVersion.chains)?.chainHeadBlock.number

    return [latestBlock, headBlock]
}
