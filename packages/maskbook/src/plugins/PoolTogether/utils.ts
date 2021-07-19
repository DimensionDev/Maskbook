import { ChainId } from '@masknet/web3-shared'
import { ONE_SECOND, ONE_WEEK_SECONDS } from './constants'
import type { Pool } from './types'

/**
 * Converts seconds to days, hours, minutes, seconds
 * @param totalSeconds
 * @return {days,hours,minutes,seconds}
 **/
export const parseSeconds = (totalSeconds: number) => {
    let secs = totalSeconds

    let days = 0
    if (secs >= 86400) {
        days = Math.floor(secs / 86400)
        secs -= days * 86400
    }

    let hours = 0
    if (days || secs >= 3600) {
        hours = Math.floor(secs / 3600)
        secs -= hours * 3600
    }

    let minutes = 0
    if (hours || secs >= 60) {
        minutes = Math.floor(secs / 60)
        secs -= minutes * 60
    }

    let seconds = 0
    if (minutes || secs >= 1) {
        seconds = Math.floor(secs / 1)
    }

    return {
        days,
        hours,
        minutes,
        seconds,
    }
}

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

    let formatedPrize
    if (!Number.isNaN(rawPrize)) {
        formatedPrize = `\$${rawPrize.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    } else {
        const pirzeAmount = Number.parseFloat(pool.prize.amount)
        formatedPrize = `${pirzeAmount.toLocaleString(undefined, {
            maximumFractionDigits: pirzeAmount >= 10 ? 0 : 2,
        })} ${pool.tokens.underlyingToken.symbol}`
    }
    return formatedPrize
}

export const calculateSecondsRemaining = (pool: Pool) => {
    const startedAt = Number.parseInt(pool.prize.prizePeriodStartedAt.hex, 16)
    const seconds = Number.parseInt(pool.prize.prizePeriodSeconds.hex, 16)
    return startedAt + seconds - Date.now() / ONE_SECOND
}

export const getNetworkColor = (chainId: ChainId) => {
    switch (chainId) {
        case ChainId.Mainnet:
            return '#617fea'
        case ChainId.Matic:
            return '#7b41da'
        // add more if needed
    }
    return '#f1f1f1'
}
