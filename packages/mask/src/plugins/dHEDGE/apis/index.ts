import type { Fund, Funds, FundsByInvestor, PerformanceHistory, Period, Pool } from '../types'
import { getChainIdFromCode } from '../utils'

export async function fetchPool(address: string, url: string) {
    const body = {
        query: `query Fund($fundAddress: String!) {
            fund(address: $fundAddress) {
                address
                name
                blockchainCode
                managerName
                managerAddress
                managerLogicAddress
                poolDetails
                riskFactor
                totalValue
                performance
                poolType
                balanceOfManager
                totalSupply
            }
        }`,
        variables: { fundAddress: address },
    }
    const response = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })
    const res = (await response.json())?.data as Fund
    return { ...res.fund, chainId: getChainIdFromCode(res.fund.blockchainCode) } as Pool
}

export async function fetchPoolPerformance(address: string, period: Period, url: string, sort = true) {
    const body = {
        query: `query PerformanceHistory($fundAddress: String!, $period: String!) {
            performanceHistory(address: $fundAddress, period: $period) {
                history {
                    performance
                    timestamp
                }
            }
        }`,
        variables: {
            fundAddress: address,
            period: period,
        },
    }
    const response = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })
    const history = ((await response.json())?.data.performanceHistory as PerformanceHistory).history
    if (!history) return []
    if (sort) history.sort((a, b) => Number.parseInt(a.timestamp, 10) - Number.parseInt(b.timestamp, 10))
    return history
}

export async function fetchPools(url: string) {
    const body = {
        operationName: 'AllFunds',
        variables: {
            sortBy: 'leaderboardRank',
            order: 'asc',
            page: 1,
            pageSize: 9999,
        },
        query: `query AllFunds($sortBy: String!, $order: String!, $page: Int!, $pageSize: Int!) {
            funds(sortBy: $sortBy, order: $order, page: $page, pageSize: $pageSize) {
                content {
                    address
                    name
                    managerAddress
                    managerName
                    totalValue
                    adjustedTokenPrice
                    performanceMetrics {
                        day
                        week
                        month
                        quarter
                        halfyear
                        __typename
                    }
                    blockTime
                    score
                    riskFactor
                    managerFeeNumerator
                    leaderboardRank
                    badges {
                        name
                        __typename
                    }
                    blockchainCode
                    poolType
                    __typename
                }
                totalPages
                __typename
            }
        }`,
    }

    const response = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })

    const res = (await response.json()).data as Funds

    return res.content.map((pool) => ({ ...pool, chainId: getChainIdFromCode(pool.blockchainCode) }))
}

export async function fetchReward(url: string) {
    const body = {
        variables: {},
        query: `{
            apy
        }`,
    }

    const response = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })

    const res = (await response.json()).data as { apy: number }
    return `${(res.apy * 100).toFixed(2)}%`
}

export async function fetchFunds(address: string, url: string) {
    const body = {
        operationName: 'AllFundsByInvestor',
        variables: {
            investorAddress: address,
        },
        query: `query AllFundsByInvestor($investorAddress: String!) {
            allFundsByInvestor(investorAddress: $investorAddress) {
                fundAddress
                fundName
                investorBalance
                tokenPrice
                adjustedTokenPrice
                investmentValue
                returnOnInvestment
                averageEntryPrice
                blockchainCode
                managerAddress
                createdAt
                __typename
            }
        }`,
    }

    const response = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })

    const res = (await response.json()).data as FundsByInvestor
    return res.allFundsByInvestor
}
