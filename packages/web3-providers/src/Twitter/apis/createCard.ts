import urlcat from 'urlcat'
import { getHeaders } from './getTokens.js'
import { fetch } from '../../helpers/fetch.js'
import type { TwitterBaseAPI } from '../../entry-types.js'

export async function createCard(card: TwitterBaseAPI.Card) {
    const response = await fetch(
        urlcat('https://caps.twitter.com/v2/cards/create.json', {
            headers: getHeaders(),
            method: 'POST',
            credentials: 'include',
            body: `card_data=${encodeURIComponent(JSON.stringify(card))}`,
        }),
    )

    return response
}
