import urlcat from 'urlcat'
import { fetchCachedJSON } from '@masknet/web3-providers/helpers'
import { TWEET_BASE_URL } from '../constants.js'

interface TweetData {
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

interface TweetDataResponse {
    results: TweetData[]
}

export async function getTweetData(tweetAddress: string) {
    const { results } = await fetchCachedJSON<TweetDataResponse>(urlcat(TWEET_BASE_URL, { tweetID: tweetAddress }))
    return results
}
