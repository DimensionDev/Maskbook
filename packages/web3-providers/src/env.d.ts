/// <reference types="@masknet/global-types/webpack" />

declare module 'twitter-text' {
    export default {
        parseTweet(tweet: string): {
            weightedLength: number
        }
    }
}
