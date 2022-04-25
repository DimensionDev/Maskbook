import type { PostIVIdentifier, ProfileIdentifier, ProfileInformation } from '@masknet/shared-base'
import { queryProfilesDB } from '../../database/persona/db'
import { queryPostDB } from '../../database/post'
import { toProfileInformation } from '../__utils__/convert'

export async function hasRecipientAvailable(whoAmI: ProfileIdentifier): Promise<boolean> {
    const profiles = await queryProfilesDB({ hasLinkedPersona: true, network: whoAmI.network })

    if (profiles.length === 0) return false
    if (profiles.length > 1) return true
    return !profiles[0].identifier.equals(whoAmI)
}

export async function getRecipients(whoAmI: ProfileIdentifier): Promise<ProfileInformation[]> {
    const profiles = (await queryProfilesDB({ hasLinkedPersona: true, network: whoAmI.network })).filter(
        (x) => !x.identifier.equals(whoAmI) && x.linkedPersona,
    )
    return toProfileInformation(profiles)
}

export async function getIncompleteRecipientsOfPost(id: PostIVIdentifier): Promise<ProfileInformation[]> {
    const nameInDB = (await queryPostDB(id))?.recipients
    if (nameInDB === 'everyone') return []
    if (!nameInDB) return []

    const profiles = (
        await queryProfilesDB({
            identifiers: [...nameInDB.keys()],
            hasLinkedPersona: true,
        })
    ).filter((x) => x.linkedPersona)
    return toProfileInformation(profiles)
}
