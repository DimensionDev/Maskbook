import { OMEN_SUBGRAPH_URL } from '../constants'
import type { tokenData, fpmmData, fpmmTransactionsData, fpmmLiquidityData } from '../types'

let cachedMarketDetails: fpmmData | undefined
let marketDetailsLastCachedAt = Date.now()
let marketDetailsLastIdCached: string
export async function fetchMarket(id: string) {
    // Check if it's cached first
    if (marketDetailsLastIdCached === id && cachedMarketDetails && Date.now() - marketDetailsLastCachedAt > 30 * 1000) {
        return cachedMarketDetails
    }

    const body = {
        query: `
        {
            fixedProductMarketMaker(id: "${id}") {
                id
                creator
                creationTimestamp
                collateralToken
                fee
                collateralVolume
                usdVolume
                outcomeTokenAmounts
                outcomeTokenMarginalPrices
                lastActiveDay
                runningDailyVolume
                usdRunningDailyVolume
                runningDailyVolumeByHour
                usdRunningDailyVolumeByHour
                question {
                    title
                    category
                }
                data
                title
                outcomes
                category
                language
                openingTimestamp
                timeout
                resolutionTimestamp
                payouts
                currentAnswer
                currentAnswerBond
                currentAnswerTimestamp
                answerFinalizedTimestamp
                poolMembers {
                    funder {
                      id
                    }
                    amount
                }
            }
        }`,
    }

    const response = await fetch(OMEN_SUBGRAPH_URL, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })

    cachedMarketDetails = (await response.json())?.data
    marketDetailsLastCachedAt = Date.now()
    marketDetailsLastIdCached = id

    return cachedMarketDetails
}

let cachedMarketHistory: fpmmTransactionsData | undefined
let marketHistoryLastCachedAt = Date.now()
let marketHistoryLastIdCached: string
export async function fetchHistory(id: string) {
    // Check if it's cached first
    if (marketHistoryLastIdCached === id && cachedMarketHistory && Date.now() - marketHistoryLastCachedAt > 30 * 1000) {
        return cachedMarketHistory
    }

    const body = {
        query: `
        {
            fpmmTransactions(where: {fpmm_contains: "${id}"}) {
                id
                user {
                    id
                }
                creationTimestamp
                transactionType
                transactionHash
                collateralTokenAmount
                sharesOrPoolTokenAmount
                additionalSharesCost
            }
        }`,
    }

    const response = await fetch(OMEN_SUBGRAPH_URL, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })

    cachedMarketHistory = (await response.json())?.data
    marketHistoryLastCachedAt = Date.now()
    marketHistoryLastIdCached = id

    return cachedMarketHistory
}

let cachedMarketLiquidity: fpmmLiquidityData | undefined
let marketLiquidityLastCachedAt = Date.now()
let marketLiquidityLastIdCached: string
export async function fetchLiquidity(id: string) {
    // Check if it's cached first
    if (
        marketLiquidityLastIdCached === id &&
        cachedMarketLiquidity &&
        Date.now() - marketLiquidityLastCachedAt > 30 * 1000
    ) {
        return cachedMarketLiquidity
    }

    const body = {
        query: `
        {
            fpmmLiquidities(where: {fpmm_contains: "${id}"}) {
                id
                type
                outcomeTokenAmounts
                collateralTokenAmount
                additionalLiquidityParameter
                funder {
                    id
                }
                sharesAmount
                collateralRemovedFromFeePool
                creationTimestamp
                transactionHash
                additionalSharesCost
            }
        }`,
    }

    const response = await fetch(OMEN_SUBGRAPH_URL, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })

    cachedMarketLiquidity = (await response.json())?.data
    marketLiquidityLastCachedAt = Date.now()
    marketLiquidityLastIdCached = id

    return cachedMarketLiquidity
}

let cachedToken: tokenData | undefined
let tokenLastCachedAt = Date.now()
let tokenLastIdCached: string
export async function fetchToken(id: string) {
    // Check if it's cached first
    if (tokenLastIdCached === id && cachedToken && Date.now() - tokenLastCachedAt > 30 * 1000) {
        return cachedToken
    }

    const body = {
        query: `
        {
            registeredToken(id: "${id}") {
                id
                address
                decimals
                name
                symbol
            }
        }`,
    }

    const response = await fetch(OMEN_SUBGRAPH_URL, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })

    cachedToken = (await response.json())?.data
    tokenLastCachedAt = Date.now()
    tokenLastIdCached = id

    return cachedToken
}
