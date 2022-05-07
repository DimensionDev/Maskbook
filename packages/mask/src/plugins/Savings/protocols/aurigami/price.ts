import type Web3 from 'web3'
import { ChainId } from '@masknet/web3-shared-evm'
import { getUniswapV2PairPrice } from '../common/tokens'
import { Token } from '@uniswap/sdk-core'
import { ZERO } from '@masknet/web3-shared-base'
import type BigNumber from 'bignumber.js'

const PAIR_PLY = {
    token0: new Token(ChainId.Aurora, '0x09c9d464b58d96837f8d8b6f4d9fe4ad408d3a4f', 18, 'PLY'),
    token1: new Token(ChainId.Aurora, '0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d', 24, 'NEAR'),
    pair: '0x044b6b0cd3bb13d2b9057781df4459c66781dce7',
}

const PAIR_NEAR = {
    token0: new Token(ChainId.Aurora, '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d', 24, 'NEAR'),
    token1: new Token(ChainId.Aurora, '0x4988a896b1227218e4a686fde5eabdcabd91571f', 6, 'USDT'),
    pair: '0x03b666f3488a7992b2385b12df7f35156d7b29cd',
}

const PAIR_AURORA = {
    token1: new Token(ChainId.Aurora, '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d', 24, 'NEAR'),
    token0: new Token(ChainId.Aurora, '0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79', 18, 'AURORA'),
    pair: '0x1e0e812fbcd3eb75d8562ad6f310ed94d258d008',
}

const PAIR_TRI = {
    token0: new Token(ChainId.Aurora, '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d', 24, 'NEAR'),
    token1: new Token(ChainId.Aurora, '0xfa94348467f64d5a457f75f8bc40495d33c65abb', 18, 'TRI'),
    pair: '0x84b123875f0f36b966d0b6ca14b31121bd9676ad',
}

export const MARKETS_NOT_IN_PRICE_ORACLE = ['auPLY', 'auNEAR', 'auTRI', 'auAURORA', 'auSTNEAR']

export async function getNoneInPriceOraclePrices(web3: Web3, symbol?: string) {
    if (!symbol) return ZERO
    const plyPriceInNear = await getUniswapV2PairPrice(
        PAIR_PLY.pair,
        PAIR_PLY.token0,
        PAIR_PLY.token1,
        PAIR_PLY.token0,
        web3,
    )
    const auroraPriceInNear = await getUniswapV2PairPrice(
        PAIR_AURORA.pair,
        PAIR_AURORA.token0,
        PAIR_AURORA.token1,
        PAIR_AURORA.token0,
        web3,
    )

    const triPriceInNear = await getUniswapV2PairPrice(
        PAIR_TRI.pair,
        PAIR_TRI.token0,
        PAIR_TRI.token1,
        PAIR_TRI.token1,
        web3,
    )
    const nearPriceInUsdt = await getUniswapV2PairPrice(
        PAIR_NEAR.pair,
        PAIR_NEAR.token0,
        PAIR_NEAR.token1,
        PAIR_NEAR.token0,
        web3,
    )
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
