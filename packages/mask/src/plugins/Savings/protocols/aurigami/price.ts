import type Web3 from 'web3'
import { createERC20Tokens, getTraderConstants, ChainId } from '@masknet/web3-shared-evm'
import { getUniswapV2PairPrice } from '../common/tokens'
import type { TokenDetail } from '../../types'
import { ZERO } from '@masknet/web3-shared-base'
import type BigNumber from 'bignumber.js'
import { getPairAddress } from '../../../Trader/helpers/pair'
import { Token } from '@uniswap/sdk-core'

export const PLY = createERC20Tokens('PLY_ADDRESS', 'PLY', 'PLY', 18)[ChainId.Aurora]
export const NEAR = createERC20Tokens('NEAR_ADDRESS', 'Near', 'NEAR', 24)[ChainId.Aurora]
export const USDT = createERC20Tokens('USDT_ADDRESS', 'Tether USD', 'USDT', 6)[ChainId.Aurora]
export const AURORA = createERC20Tokens('AURORA_ADDRESS', 'AURORA', 'AURORA', 18)[ChainId.Aurora]
export const TRI = createERC20Tokens('TRI_ADDRESS', 'TRI', 'TRI', 18)[ChainId.Aurora]

const PAIR_PLY = {
    token0: PLY,
    token1: NEAR,
    price: PLY,
}

const PAIR_NEAR = {
    token0: NEAR,
    token1: USDT,
    price: NEAR,
}

const PAIR_AURORA = {
    token0: AURORA,
    token1: NEAR,
    price: AURORA,
}

const PAIR_TRI = {
    token0: NEAR,
    token1: TRI,
    price: TRI,
}

// get price from dex
export const MARKETS_NOT_IN_PRICE_ORACLE = ['auPLY', 'auNEAR', 'auTRI', 'auAURORA', 'auSTNEAR']

export async function getPriceFromTrisolaris(
    token0: TokenDetail,
    token1: TokenDetail,
    priceToken: TokenDetail,
    web3: Web3,
) {
    const DEX_TRADE = getTraderConstants(ChainId.Aurora)
    if (!DEX_TRADE.TRISOLARIS_FACTORY_ADDRESS || !DEX_TRADE.TRISOLARIS_INIT_CODE_HASH) return ZERO
    const tokenA = new Token(ChainId.Aurora, token0.address, token0.decimals, token0.symbol, token0.name)
    const tokenB = new Token(ChainId.Aurora, token1.address, token1.decimals, token1.symbol, token1.name)
    const priceOfToken = new Token(
        ChainId.Aurora,
        priceToken.address,
        priceToken.decimals,
        priceToken.symbol,
        priceToken.name,
    )
    const pairAddress = getPairAddress(
        DEX_TRADE.TRISOLARIS_FACTORY_ADDRESS,
        DEX_TRADE.TRISOLARIS_INIT_CODE_HASH,
        tokenA,
        tokenB,
    )
    return getUniswapV2PairPrice(pairAddress, tokenA, tokenB, priceOfToken, web3)
}

export async function getNoneInPriceOraclePrices(web3: Web3, symbol?: string) {
    if (!symbol) return ZERO
    const plyPriceInNear = await getPriceFromTrisolaris(PAIR_PLY.token0, PAIR_PLY.token1, PAIR_PLY.price, web3)
    const auroraPriceInNear = await getPriceFromTrisolaris(
        PAIR_AURORA.token0,
        PAIR_AURORA.token1,
        PAIR_AURORA.price,
        web3,
    )

    const triPriceInNear = await getPriceFromTrisolaris(PAIR_TRI.token0, PAIR_TRI.token1, PAIR_TRI.price, web3)
    const nearPriceInUsdt = await getPriceFromTrisolaris(PAIR_NEAR.token0, PAIR_NEAR.token1, PAIR_NEAR.price, web3)
    if (plyPriceInNear && nearPriceInUsdt && auroraPriceInNear && triPriceInNear) {
        const priceList: { [key: string]: BigNumber } = {
            auPLY: nearPriceInUsdt.multipliedBy(plyPriceInNear),
            auNEAR: nearPriceInUsdt,
            auSTNEAR: nearPriceInUsdt,
            auTRI: nearPriceInUsdt.multipliedBy(triPriceInNear),
            auAURORA: nearPriceInUsdt.multipliedBy(auroraPriceInNear),
        }
        return priceList[symbol] || ZERO
    }
    return ZERO
}
