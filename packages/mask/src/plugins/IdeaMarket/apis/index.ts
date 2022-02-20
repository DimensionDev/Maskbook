import { SUBGRAPH_URL } from '../constants'
import { first } from 'lodash-unified'
import type { IdeaToken } from '../types'

export async function fetchIdeaToken(marketName: string, tokenName: string) {
    const body = {
        query: `query IdeaToken($tokenName: String!) {
            ideaTokens(where: {name: $tokenName}) {
                name
                tokenID
                market {
                    name
                }
                rank
                latestPricePoint {
                    price
                }
                supply
                holders
                daiInToken
            }
        }`,
        variables: { marketName: marketName, tokenName: tokenName },
    }
    const response = await fetch(SUBGRAPH_URL, {
        body: JSON.stringify(body),
        method: 'POST',
    })

    const res = (await response.json())?.data.ideaTokens
    return first(res) as IdeaToken
}

export async function fetchAllTokens() {
    const body = {
        query: `query IdeaToken {
            ideaTokens{
                id
                name
                tokenID
                market {
                    name
                }
                rank
                latestPricePoint {
                    price
                }
                supply
                holders
                daiInToken
            }
        }`,
    }
    const response = await fetch(SUBGRAPH_URL, {
        body: JSON.stringify(body),
        method: 'POST',
    })

    const res = (await response.json())?.data
    return res
}

export async function fetchUserTokens(holder: string) {
    const body = {
        query: `query IdeaTokenBalances ($holder: String!) {
            ideaTokenBalances(where: {holder: $holder}){
                id
                token {
                    id
                }
                holder
                amount
            }
        }`,
        variables: { holder },
    }
    const response = await fetch(SUBGRAPH_URL, {
        body: JSON.stringify(body),
        method: 'POST',
    })

    const res = (await response.json())?.data
    return res
}
