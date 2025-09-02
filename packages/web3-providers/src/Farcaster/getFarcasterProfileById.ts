import urlcat from 'urlcat'
import { fireflySessionHolder } from '../Firefly/SessionHolder'
import { FIREFLY_ROOT_URL } from '../Firefly/constants'
import { formatFarcasterProfileFromFirefly, resolveFireflyResponseData } from '../Firefly/helpers'
import { getFarcasterFriendship } from './getFarcasterFriendship'
import type { FireflyConfigAPI } from '../types/Firefly'

export async function getFarcasterProfileById(profileId: string, viewerFid?: string) {
    const response = await fireflySessionHolder.fetch<FireflyConfigAPI.UserResponse>(
        urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/user/profile', {
            fid: profileId,
            sourceFid: viewerFid,
        }),
        {
            method: 'GET',
        },
    )
    const user = resolveFireflyResponseData(response)
    const friendship = viewerFid ? await getFarcasterFriendship(viewerFid, profileId) : null
    return formatFarcasterProfileFromFirefly({ ...user, ...friendship })
}
