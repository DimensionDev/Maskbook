import { THEGRAPH_UNISWAP_V2 } from '../../constants'

interface QueryPairsResponse {
    data: {
        pairs: {
            id: string
            reserve0: string
            reserve1: string
        }[]
    }
}

export async function queryPairs(ids: string[]) {
    const response = await fetch(THEGRAPH_UNISWAP_V2, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                pairs (where: { id_in: [${ids.join()}] }) {
                  id
                  reserve0
                  reserve1
                }
            }
            `,
            variables: null,
        }),
    })
    return response.json() as Promise<QueryPairsResponse>
}
