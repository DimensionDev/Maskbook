import urlcat from 'urlcat'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import { TWEET_BASE_URL } from '../constants.js'

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
    const { results } = await fetchJSON<TweetDataResponse>(urlcat(TWEET_BASE_URL, tweetAddress), undefined, {
        cached: true,
        squashed: true,
    })
    return results
}
