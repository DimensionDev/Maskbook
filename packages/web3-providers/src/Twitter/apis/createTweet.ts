/* cspell:disable */
import * as Parser from /* webpackDefer: true */ 'twitter-text'
import { getHeaders } from './getTokens.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { TwitterBaseAPI } from '../../entry-types.js'
import { twitterDomainMigrate } from '@masknet/shared-base'

const features = {
    freedom_of_speech_not_reach_fetch_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    longform_notetweets_consumption_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    responsive_web_enhance_cards_enabled: false,
    responsive_web_graphql_exclude_directive_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_media_download_video_enabled: false,
    responsive_web_twitter_article_tweet_consumption_enabled: false,
    standardized_nudges_misinfo: true,
    tweet_awards_web_tipping_enabled: false,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    tweetypie_unmention_optimization_enabled: true,
    verified_phone_label_enabled: false,
    view_counts_everywhere_api_enabled: true,
    c9s_tweet_anatomy_moderator_badge_enabled: false,
    responsive_web_home_pinned_timelines_enabled: false,
}

const toggles = { withArticleRichContentState: false, withAuxiliaryUserLabels: false }
const queryIdMap = {
    CreateScheduledTweet: 'LCVzRQGxOaGnOnYH01NQXg',
    CreateNoteTweet: 'nI7OgbViyRrJn6RKXPrbJw',
    CreateTweet: '5V_dkq1jfalfiFOEZ4g47A',
} as const
const dataFieldMap = {
    CreateScheduledTweet: 'posttweet_created',
    CreateNoteTweet: 'notetweet_create',
    CreateTweet: 'create_tweet',
} as const

export async function createTweet(tweet: TwitterBaseAPI.Tweet) {
    const variables = {
        ...tweet,
        dark_request: false,
        withDownvotePerspective: false,
        withReactionsMetadata: false,
        withReactionsPerspective: false,
        withSuperFollowsTweetFields: true,
        withSuperFollowsUserFields: true,
        semantic_annotation_ids: [],
    }
    // Remove link query
    const parsedTweet = Parser.default.parseTweet(variables.tweet_text)
    const overLength = parsedTweet.weightedLength > 280
    const scheduled = typeof variables.execute_at !== 'undefined'
    const operationName =
        scheduled ? 'CreateScheduledTweet'
        : overLength ? 'CreateNoteTweet'
        : 'CreateTweet'
    const queryId = queryIdMap[operationName]
    const response = await fetchJSON<TwitterBaseAPI.CreateTweetResponse>(
        twitterDomainMigrate(`https://x.com/i/api/graphql/${queryId}/${operationName}`),
        {
            headers: getHeaders({
                'content-type': 'application/json; charset=utf-8',
            }),
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                variables,
                features,
                fieldToggles: toggles,
                queryId,
            }),
        },
    )

    const field = dataFieldMap[operationName]
    if (process.env.NODE_ENV === 'development') {
        if (response.errors) {
            // TODO Fetch main.xxx.js and extract queryIds from Twitter's client code.
            console.error(
                "Errors occupied, query id chould be outdated. Please check twitter's client code in main.xxx.js",
                'Response Errors:',
                response.errors,
            )
        }
    }
    return response.data[field].tweet_results.result
}
