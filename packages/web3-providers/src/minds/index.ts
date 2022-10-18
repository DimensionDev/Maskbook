import urlcat from 'urlcat'
import type { MindBaseAPI } from '../types/Minds.js'

export class MindsAPI implements MindBaseAPI.Provider {
    async getUserByScreenName(screenName?: string) {
        if (!screenName) return
        const response = await fetch(urlcat('https://www.minds.com/api/v1/channel/', screenName))
        const data = await response.json()
        return data.channel
    }
}
