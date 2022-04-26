import { SUBGRAPH_URL, TWITTER_BEARER_TOKEN } from '../constants'
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
                    marketID
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

export async function fetchAllTokens(searchTerm: string, page: number, filters: string[]) {
    const rowsPerPage = 20

    const body = {
        query: `query IdeaToken($searchTerm: String!, $rowsPerPage: Int!, $skip: Int!, $filters: [String!]!) {
            ideaTokens(first: $rowsPerPage, skip: $skip, orderBy: daiInToken, orderDirection: desc, where: { name_contains: $searchTerm, market_in: $filters }){
                id
                name
                tokenID
                market {
                    id
                    marketID
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
        variables: {
            searchTerm: searchTerm,
            rowsPerPage: rowsPerPage,
            skip: page === 0 ? 0 : page * rowsPerPage,
            filters: filters,
        },
    }
    const response = await fetch(SUBGRAPH_URL, {
        body: JSON.stringify(body),
        method: 'POST',
    })

    const res: IdeaToken[] = (await response.json())?.data.ideaTokens

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
                        id
                        name
                        marketID
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

    const res = (await response.json())?.data.ideaTokenBalances

    return res
}

export async function fetchTwitterLookup(token: IdeaToken) {
    const response = await fetch(
        `https://api.twitter.com/2/users/by/username/${token.name.slice(1)}?user.fields=profile_image_url`,
        {
            headers: {
                Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
            },
        },
    )
    const res = (await response.json())?.data

    return res
}

export async function fetchTwitterLookups(tokens: IdeaToken[]) {
    const twitterHandles = tokens
        .filter((token) => token.market.id === '0x1')
        .map((token) => token.name.slice(1))
        .join(',')
    const response = await fetch(
        `https://api.twitter.com/2/users/by?usernames=${twitterHandles}&user.fields=profile_image_url`,
        {
            headers: {
                Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
            },
        },
    )
    const twitterLookups = (await response.json())?.data

    // create a hashmap in order to optimize twitter username lookups
    const twitterLookupsToDictionary = twitterLookups.reduce(
        (result: { [x: string]: any }, lookup: { username: string }) => {
            result[lookup.username.toLowerCase()] = lookup
            return result
        },
        {},
    )

    const tokensWithTwitterLookups = tokens.map((token: IdeaToken) => {
        if (token.market.id === '0x1') {
            return { ...token, twitter: twitterLookupsToDictionary[token.name.slice(1).toLowerCase()] }
        }

        return token
    })

    return tokensWithTwitterLookups
}
