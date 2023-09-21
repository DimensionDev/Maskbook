/* cspell:disable */
import { getHeaders } from './getTokens.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { TwitterBaseAPI } from '../../entry-types.js'

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
}

const toggles = { withArticleRichContentState: false, withAuxiliaryUserLabels: false }

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
    const overLength = variables.tweet_text.length > 280
    const scheduled = typeof variables.execute_at !== 'undefined'
    const queryId = scheduled
        ? 'LCVzRQGxOaGnOnYH01NQXg'
        : overLength
        ? 'pokID4auGUSzBxijrqpIlw'
        : 'tTsjMKyhajZvK4q76mpIBg'
    const queryName = scheduled ? 'CreateScheduledTweet' : overLength ? 'CreateNoteTweet' : 'CreateTweet'
    const response = await fetchJSON<TwitterBaseAPI.CreateTweetResult>(
        `https://twitter.com/i/api/graphql/${queryId}/${queryName}`,
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

    return response.data[scheduled ? 'posttweet_created' : overLength ? 'notetweet_create' : 'create_tweet']
        .tweet_results.result
}
