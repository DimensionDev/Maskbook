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

export async function fetchAllTokens(searchTerm: string) {
    const body = {
        query: `query IdeaToken($searchTerm: String!) {
            ideaTokens(first: 1000, orderBy: daiInToken, orderDirection: desc, where: { name_contains: $searchTerm }){
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
                dayChange
            }
        }`,
        variables: { searchTerm: searchTerm },
    }
    const response = await fetch(SUBGRAPH_URL, {
        body: JSON.stringify(body),
        method: 'POST',
    })

    const res = (await response.json())?.data
    return res
}

export async function fetchUserTokensBalances(holder: string) {
    const body = {
        query: `query IdeaTokenBalances ($holder: String!) {
            ideaTokenBalances(where: {holder: $holder}){
                token {
                    id
                    name
                    market {
                        name
                    }
                    latestPricePoint {
                      price
                    }
                    daiInToken
                    dayChange
                }
                id
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
