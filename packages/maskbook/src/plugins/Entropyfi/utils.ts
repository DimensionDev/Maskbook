import { Token } from '@uniswap/sdk-core'
import type { I18NFunction } from '../../utils'
import { ONE_DAY_SECONDS, ONE_WEEK_SECONDS } from './constants'
import type { rawTokenMap, TokenMap } from './types'
import { ChainId } from '@masknet/web3-shared'

export function getPrizePeriod(t: I18NFunction, preiod: number) {
    if (preiod === ONE_DAY_SECONDS) {
        return t('daily')
    } else if (preiod === ONE_WEEK_SECONDS) {
        return t('weekly')
    }
    return t('days', { preiod: (preiod / ONE_WEEK_SECONDS).toFixed() })
}

export function formTokenMap(rawTokenMap: rawTokenMap): TokenMap {
    // eslint-disable-next-line prefer-const
    let tokenMap: TokenMap = {}
    const chainIds = Object.keys(rawTokenMap).map((value) => parseInt(value, 10))
    for (const chainId of chainIds) {
        const poolIds = Object.keys(tokenMap[chainId])

        tokenMap[chainId] = {}
        for (const poolId of poolIds) {
            const decimal = rawTokenMap[chainId][poolId].decimal
            const principalToken = rawTokenMap[chainId][poolId].principalToken
            const shortToken = rawTokenMap[chainId][poolId].shortToken
            const longToken = rawTokenMap[chainId][poolId].longToken
            const sponsorToken = rawTokenMap[chainId][poolId].sponsorToken
            tokenMap[chainId][poolId] = {
                principalToken: new Token(chainId, principalToken, decimal, 'USDT', 'USDT Coin'),
                shortToken: new Token(chainId, shortToken, decimal, 'stBTC-USDT', 'stbtc usdt'),
                longToken: new Token(chainId, longToken, decimal, 'lgBTC-USDT', 'lgbtc usdt'),
                sponsorToken: new Token(chainId, sponsorToken, decimal, 'spBTC-USDT', 'spbtc usdt'),
            }
        }
    }
    return tokenMap
}

export const getSlicePoolId = (poolId: string): Array<string> => {
    const slicePoolId = poolId.split('-')
    const COIN = slicePoolId[slicePoolId.length - 1]
    return [poolId.replace(`-${COIN}`, ''), COIN]
}

export const getNetworkColor = (chainId: ChainId) => {
    switch (chainId) {
        case ChainId.Mainnet:
            return '#617fea'
        case ChainId.Matic:
            return '#7b41da'
        // add more if needed
        default:
            return '#f1f1f1'
    }
}
