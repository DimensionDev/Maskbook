import BigNumber from 'bignumber.js'
import stringify from 'json-stable-stringify'
import { ChainId as UniswapChainId, Token, Fetcher, Route } from '@uniswap/sdk'
import { getConstant } from '../../../../web3/helpers'
import { CONSTANTS } from '../../../../web3/constants'
import PREDICTION_MARKET_TOKENS from './prediction_market_tokens.json'
import { getChainId } from '../../../../extension/background-script/EthereumService'
import { ChainId } from '../../../../web3/types'
import type { Coin } from '../../types'

interface QueryPairsResponse {
    data: {
        pairs: {
            id: string
            reserve0: string
            reserve1: string
            token0: {
                decimals: number
            }
            token1: {
                decimals: number
            }
        }[]
    }
}

export async function queryPairsFromSubgraph(from: string, ids: string[]) {
    if (!ids.length) return []
    const response = await fetch(from, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                pairs (where: { id_in: ${stringify(ids.map((x) => x.toLowerCase()))} }) {
                    id
                    reserve0
                    reserve1
                    token0 {
                        decimals
                    }
                    token1 {
                        decimals
                    }
                }
            }
            `,
            variables: null,
        }),
    })
    const { data } = (await response.json()) as QueryPairsResponse
    return data.pairs.map((x) => ({
        id: x.id,
        reserve0: new BigNumber(x.reserve0).multipliedBy(new BigNumber(10).pow(x.token0.decimals)).toFixed(),
        reserve1: new BigNumber(x.reserve1).multipliedBy(new BigNumber(10).pow(x.token1.decimals)).toFixed(),
    }))
}

export function getAllCoins() {
    return PREDICTION_MARKET_TOKENS as Coin[]
}
