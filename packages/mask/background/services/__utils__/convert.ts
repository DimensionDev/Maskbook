import type { ProfileInformation } from '@masknet/shared-base'
import { queryAvatarsDataURL } from '../../database/avatar-cache/avatar'
import type { ProfileRecord } from '../../database/persona/db'

/** @internal */
export async function toProfileInformation(profiles: ProfileRecord[]) {
    const result: ProfileInformation[] = []
    for (const profile of profiles) {
        result.push({
            identifier: profile.identifier,
            nickname: profile.nickname,
            fingerprint: profile.linkedPersona?.compressedPoint,
        })
    }

    const avatars = await queryAvatarsDataURL(result.map((x) => x.identifier))
    result.forEach((x) => avatars.has(x.identifier) && (x.avatar = avatars.get(x.identifier)))
    return result
}
