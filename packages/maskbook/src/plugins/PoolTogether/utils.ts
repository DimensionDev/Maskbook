import { ChainId } from '@masknet/web3-shared'
import { ONE_SECOND, ONE_WEEK_SECONDS } from './constants'
import type { Pool } from './types'

export const subtractDates = (dateA: Date, dateB: Date) => {
    // https://github.com/pooltogether/pooltogether-community-ui/blob/master/lib/utils/subtractDates.js

    let msA = dateA.getTime()
    let msB = dateB.getTime()

    let diff = msA - msB

    let days = 0
    if (diff >= 86400000) {
        days = Math.floor(diff / 86400000)
        diff -= days * 86400000
    }

    let hours = 0
    if (days || diff >= 3600000) {
        hours = Math.floor(diff / 3600000)
        diff -= hours * 3600000
    }

    let minutes = 0
    if (hours || diff >= 60000) {
        minutes = Math.floor(diff / 60000)
        diff -= minutes * 60000
    }

    let seconds = 0
    if (minutes || diff >= 1000) {
        seconds = Math.floor(diff / 1000)
    }

    return {
        days,
        hours,
        minutes,
        seconds,
    }
}

export const calculateOdds = (usersTicketBalance: number, totalSupply: number, numberOfWinners: number) => {
    if (usersTicketBalance === 0 || isNaN(usersTicketBalance)) {
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
    return parseInt(pool.prize.weeklyTotalValueUsd) / (ONE_WEEK_SECONDS / parseInt(pool.config.prizePeriodSeconds))
}

export const calculateSecondsRemaining = (pool: Pool) => {
    return (
        parseInt(pool.prize.prizePeriodStartedAt.hex, 16) +
        parseInt(pool.prize.prizePeriodSeconds.hex, 16) -
        new Date().getTime() / ONE_SECOND
    )
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
