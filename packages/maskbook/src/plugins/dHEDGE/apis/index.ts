import { DHEDGE_API_URL } from '../constants'
import type { DHedgeFund, DHedgePool } from '../types'

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

export async function fetchPool(address: string) {
    let body = {
        query: `query Fund($fundAddress: String!) {
            fund(address: $fundAddress) {
                name
                managerName
                poolDetails
            }
        }`,
        variables: { fundAddress: address },
    }

    const response = await fetch(DHEDGE_API_URL, {
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })
    const res = (await response.json())?.data as DHedgeFund
    return res.fund as DHedgePool
}
