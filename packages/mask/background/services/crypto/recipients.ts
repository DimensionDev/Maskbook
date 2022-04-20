import type { PostIVIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { queryAvatarDataURL } from '../../database/avatar-cache/avatar'
import { ProfileRecord, queryProfilesDB } from '../../database/persona/db'
import { queryPostDB } from '../../database/post'

export interface Recipient {
    identifier: ProfileIdentifier
    nickname?: string
    fingerprint: string
    avatarURL?: string
}
export async function hasRecipientAvailable(whoAmI: ProfileIdentifier): Promise<boolean> {
    const profiles = await queryProfilesDB({ hasLinkedPersona: true, network: whoAmI.network })

    if (profiles.length === 0) return false
    if (profiles.length > 1) return true
    return !profiles[0].identifier.equals(whoAmI)
}

export async function getRecipients(whoAmI: ProfileIdentifier): Promise<Recipient[]> {
    const profiles = (await queryProfilesDB({ hasLinkedPersona: true, network: whoAmI.network })).filter(
        (x) => !x.identifier.equals(whoAmI) && x.linkedPersona,
    )
    return toRecipients(profiles)
}

export async function getIncompleteRecipientsOfPost(id: PostIVIdentifier): Promise<Recipient[]> {
    const nameInDB = (await queryPostDB(id))?.recipients
    if (nameInDB === 'everyone') return []
    if (!nameInDB) return []

    const profiles = (
        await queryProfilesDB({
            identifiers: [...nameInDB.keys()],
            hasLinkedPersona: true,
        })
    ).filter((x) => x.linkedPersona)
    return toRecipients(profiles)
}

async function toRecipients(profiles: ProfileRecord[]) {
    const result: Recipient[] = []
    for (const profile of profiles) {
        result.push({
            identifier: profile.identifier,
            nickname: profile.nickname,
            fingerprint: profile.linkedPersona!.compressedPoint,
        })
    }

    await Promise.allSettled(result.map(async (x) => (x.avatarURL = await queryAvatarDataURL(x.identifier))))
    return result
}
