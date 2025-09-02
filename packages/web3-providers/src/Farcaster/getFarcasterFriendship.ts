import urlcat from 'urlcat'
import { FIREFLY_ROOT_URL } from '../Firefly/constants'
import { resolveFireflyResponseData } from '../Firefly/helpers'
import { fetchJSON } from '../helpers/fetchJSON'
import type { FireflyConfigAPI } from '../types/Firefly'

export async function getFarcasterFriendship(sourceFid: string, destFid: string) {
    const response = await fetchJSON<FireflyConfigAPI.FriendshipResponse>(
        urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/friendship', {
            sourceFid,
            destFid,
        }),
        {
            method: 'GET',
        },
    )
    return resolveFireflyResponseData<FireflyConfigAPI.FriendshipResponse['data']>(response)
}
