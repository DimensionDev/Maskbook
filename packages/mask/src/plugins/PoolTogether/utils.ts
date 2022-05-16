import { ChainId } from '@masknet/web3-shared-evm'
import type { I18NFunction } from '../../utils'
import { ONE_DAY_SECONDS, ONE_SECOND, ONE_WEEK_SECONDS } from './constants'
import type { Pool } from './types'

export const calculateOdds = (usersTicketBalance: number, totalSupply: number, numberOfWinners: number) => {
    if (usersTicketBalance === 0 || Number.isNaN(usersTicketBalance)) {
        return undefined
    }

    // Calculate odds of winning at least 1 of the possible scenarios.
    // 1/N, 2/N ... N-1/N, N/N
    // Then we always display "1 in ____" so 1 / X.
    const odds = 1 / (1 - Math.pow(totalSupply / (totalSupply + usersTicketBalance), numberOfWinners))

    return odds.toLocaleString(undefined, {
        maximumFractionDigits: odds >= 10 ? 0 : 8,
    })
}

export const calculateNextPrize = (pool: Pool) => {
    const rawPrize =
        Number.parseInt(pool.prize.weeklyTotalValueUsd, 10) /
        (ONE_WEEK_SECONDS / Number.parseInt(pool.config.prizePeriodSeconds, 10))

    if (!Number.isNaN(rawPrize)) {
        return '$' + rawPrize.toLocaleString(undefined, { maximumFractionDigits: 0 })
    } else {
        const prizeAmount = Number.parseFloat(pool.prize.amount)
        const formattedPrizeAmount = prizeAmount.toLocaleString(undefined, {
            maximumFractionDigits: prizeAmount >= 10 ? 0 : 2,
        })
        return `${formattedPrizeAmount} ${pool.tokens.underlyingToken.symbol}`
    }
}

export const calculateSecondsRemaining = (pool: Pool) => {
    if (pool.prize.prizePeriodEndAt) {
        const endAt = Number.parseInt(pool.prize.prizePeriodEndAt, 10)
        return endAt - Date.now() / ONE_SECOND
    } else {
        const startedAt = Number.parseInt(pool.prize.prizePeriodStartedAt.hex, 16)
        const seconds = Number.parseInt(pool.prize.prizePeriodSeconds.hex, 16)
        return startedAt + seconds - Date.now() / ONE_SECOND
    }
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

export function getPrizePeriod(t: I18NFunction, period: number) {
    if (period === ONE_DAY_SECONDS) {
        return t('daily')
    } else if (period === ONE_WEEK_SECONDS) {
        return t('weekly')
    }
    return t('days', { period: (period / ONE_WEEK_SECONDS).toFixed() })
}
