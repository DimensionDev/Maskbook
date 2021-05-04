import type { DHedgeFund, DHedgePool } from '../types'

export async function fetchPool(address: string, url: string) {
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
    const response = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
    })
    const res = (await response.json())?.data as DHedgeFund
    return res.fund as DHedgePool
}
