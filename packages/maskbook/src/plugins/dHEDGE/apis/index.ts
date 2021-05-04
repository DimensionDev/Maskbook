import type { DHedgeFund, DHedgePool, PerformanceHistory, Period } from '../types'

export async function fetchPool(address: string, url: string) {
    let body = {
        query: `query Fund($fundAddress: String!) {
            fund(address: $fundAddress) {
                name
                managerName
                poolDetails
                riskFactor
                totalValue
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
    const res = (await response.json())?.data as DHedgeFund
    return res.fund as DHedgePool
}

export async function fetchPoolPerformance(address: string, period: Period, url: string, sort = true) {
    let body = {
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
    if (!history) return
    if (sort) history.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp))
    return history
}
