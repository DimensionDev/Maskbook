import { DHEDGE_API_URL } from '../constants'

export interface Metadata {}

export interface ManagerProfile {
    id: number
    url: string
    handle: string
    keywords: string[]
    position: number
    avatar_url: string
    github_url: string
    total_earned: number
    organizations: Metadata
}

export interface dHEDGEPool {
    name: string
    // managed_by:
}

export async function fetchPool(id: string) {
    console.log('QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ')

    let body = `{
        "query": "query Fund($fundAddress: String!) {
            fund(address: $fundAddress) {
            address
            name
            isPrivate
            managerAddress
            managerName
            balanceOfManager
            poolDetails
            totalSupply
            totalValue
            tokenPrice
            performance
            performanceMetrics {
                day
                week
                month
                quarter
                halfyear
            }
            blockTime
            score
            riskFactor
            managerFeeNumerator
            leaderboardRank
            sortinoRatio
            downsideVolatility
            badges {
                name
            }
            fundComposition {
                tokenName
                amount
                rate
            }
        }",
        "variables": {"fundAddress":${id}}
    }`

    const response = await fetch(DHEDGE_API_URL, {
        body: body,
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })
    const { pool } = (await response.json()) as {
        pool: dHEDGEPool
        status: number
    }

    return pool
}
