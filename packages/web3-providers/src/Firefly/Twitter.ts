import urlcat from 'urlcat'
import { FIREFLY_BASE_URL } from './constants.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { type FireflyTwitterAPI } from '../types/Firefly.js'

export class FireflyTwitter {
    static async getUserInfo(screenName: string) {
        if (!screenName) return null
        const url = urlcat(FIREFLY_BASE_URL, '/v1/twitter/userinfo', {
            screenName,
        })
        const res = await fetchJSON<FireflyTwitterAPI.TwitterUserInfoResponse>(url)
        if (res.code === 0 && res.data.data.user.result.__typename === 'User') return res.data.data.user.result
        return null
    }
}
