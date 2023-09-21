/// <reference types="@masknet/global-types/webpack" />

declare module 'twitter-text' {
    const parser: {
        parseTweet(tweet: string): {
            weightedLength: number
        }
    }

    export default parser
}
