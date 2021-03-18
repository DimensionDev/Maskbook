import { VCENT_BASE_URL } from './constants'

export async function getTweetBid(id: string) {
    // doublecheck regex testing
    if (!/\d+/.test(id)) return

    const response = await fetch(`${VCENT_BASE_URL}${id}`)
    const { results } = (await response.json()) as {
        results: tweetBids[]
    }

    if (results.length === 0) return

    // return results[0].amount_usd
    return {
        amount_eth: results[0].amount_eth,
        amount_usd: results[0].amount_usd,
    }
}

/*
  v.cent API's CORS policy isn't entirely clear to me yet. Looks to me like requests from twitter.com (or maybe my requests are from localhost) are getting no Access-Control-Allow-Origin header from the server.
  Workaround, atleast when running locally, can be installing a chrome plugin like Moesif CORS to manually modify the headers.
*/

export interface tweetBids {
    id: number
    tweet_id: string
    type: string
    source_address: string
    target_address: string
    amount_eth: number // eth
    txid: string
    chain_time: string
    latest: number // 0,1
    create_time: string
    status: string
    amount_usd: number // usd
}
