import BigNumber from 'bignumber.js'
import stringify from 'json-stable-stringify'
import { ChainId, Token, Fetcher, Route } from '@uniswap/sdk'
import { getConstant } from '../../../../web3/helpers'
import { CONSTANTS } from '../../../../web3/constants'
import { DataProvider, Currency, Coin, Trending } from '../../types'
import { THEGRAPH_UNISWAP_V2 } from '../../constants'

const DAI_ADDRESS = getConstant(CONSTANTS, 'DAI_ADDRESS')
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

export async function queryPairs(ids: string[]) {
    if (!ids.length) return []
    const response = await fetch(THEGRAPH_UNISWAP_V2, {
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

export async function getCoinTrendingFromUniswap(currency: Currency, coin: Coin) {
    const PMTk = new Token(ChainId.MAINNET, coin.eth_address!, 18, coin.symbol, coin.name)
    const DAI = new Token(ChainId.MAINNET, DAI_ADDRESS, 18, 'DAI', 'DAI')
    const pair = await Fetcher.fetchPairData(PMTk, DAI)
    const route = new Route([pair], DAI)

    return {
        currency,
        dataProvider: DataProvider.UNISWAP,
        market: {
            current_price: Number(route.midPrice.invert().toSignificant(6)) / 1000,
        },
        coin,
        tickers: [],
        lastUpdated: '',
    } as Trending
}
