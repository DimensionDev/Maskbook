import urlcat from 'urlcat'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type { FireflyTwitterAPI } from '../types/Firefly.js'
import { FIREFLY_BASE_URL } from './constants.js'

/** A `User` result that actually carries the `legacy` payload callers dereference. */
export type AvailableTwitterUser = FireflyTwitterAPI.TwitterUserInfo & {
    legacy: FireflyTwitterAPI.LegacyUserInfo
}

export const FireflyTwitter = {
    async getUserInfo(screenName: string): Promise<AvailableTwitterUser | null> {
        if (!screenName) return null
        const url = urlcat(FIREFLY_BASE_URL, '/v1/twitter/userinfo', {
            screenName,
        })
        const res = await fetchJSON<FireflyTwitterAPI.TwitterUserInfoResponse>(url)
        if (res.code !== 0) return null
        // `{code: 0, data: {}}` (live fetch failed, nothing cached) and `User` results without
        // `legacy` both used to crash callers reading `user.legacy.*` — treat them as "no user".
        const user = res.data.data?.user?.result
        if (user?.__typename !== 'User' || !user.legacy) return null
        return { ...user, legacy: user.legacy }
    },

    async getUserInfoById(twitterId: string) {
        if (!twitterId) return null
        const url = urlcat(FIREFLY_BASE_URL, '/v1/twitter/userById', {
            twitterId,
        })
        const res = await fetchJSON<FireflyTwitterAPI.TwitterUserV2Response>(url)
        if (res.code === 0) return res.data.result
        return null
    },
}
