import type { MobileProfile } from '@masknet/public-api'
import type { ProfileRecord } from '../../../database/persona/type'

/** @internal */
export function profileRecordToMobileProfile(profile: ProfileRecord): MobileProfile {
    return {
        identifier: profile.identifier.toText(),
        createdAt: profile.createdAt.getTime(),
        updatedAt: profile.updatedAt.getTime(),
        nickname: profile.nickname,
        linkedPersona: !!profile.linkedPersona,
    }
}
