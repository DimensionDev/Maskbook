import { TWEET_BASE_URL } from '../constants'
import type { TweetData } from '../types'

export async function fetchTweet(id: string) {
    if (!/\d+/.test(id)) return
    console.log(`${TWEET_BASE_URL}${id}`)
    //const response = await fetch(`${TWEET_BASE_URL}${id}`)
    //const { tweet } = (await response.json()) as {
    //   tweet: TweetData
    //}
    //return tweet
}
