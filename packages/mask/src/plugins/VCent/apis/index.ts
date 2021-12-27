import { TWEET_BASE_URL } from '../constants'

export interface TweetData {
    id: string
    tweet_id: string
    type: string
    source_address: string
    target_address: string
    amount_eth: number
    txid: string
    chain_time: string
    latest: number
    create_time: string
    status: string
    amount_usd: number
}

export interface TweetDataResponse {
    results: TweetData[]
}

export async function getTweetData(tweetAddress: string) {
    const url = TWEET_BASE_URL + tweetAddress
    const response = await fetch(url)
    const tweetResponse: TweetDataResponse = await response.json()
    return (tweetResponse as TweetDataResponse).results
}
