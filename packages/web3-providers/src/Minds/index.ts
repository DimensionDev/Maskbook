import urlcat from 'urlcat'
import type { MindBaseAPI } from '../entry-types.js'
import { fetchJSON } from '../helpers/fetchJSON.js'

export class Minds {
    static async getUserByScreenName(screenName?: string) {
        if (!screenName) return null
        const { channel } = await fetchJSON<{ channel: MindBaseAPI.User }>(
            urlcat('https://www.minds.com/api/v1/channel/', screenName),
        )
        return channel
    }
}
