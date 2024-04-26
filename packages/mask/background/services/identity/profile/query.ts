import type { ProfileIdentifier, ProfileInformation } from '@masknet/shared-base'
import {
    createPersonaDBReadonlyAccess,
    type ProfileRecord,
    queryPersonasDB,
    queryProfilesDB,
    queryProfileDB,
} from '../../../database/persona/db.js'
import { hasLocalKeyOf } from '../../../database/persona/helper.js'
import { toProfileInformation } from '../../__utils__/convert.js'

export async function queryProfilesInformation(identifiers: ProfileIdentifier[]): Promise<ProfileInformation[]> {
    const profiles = await queryProfilesDB({ identifiers })
    return toProfileInformation(profiles).mustNotAwaitThisWithInATransaction
}

export async function queryProfileInformation(identifier: ProfileIdentifier): Promise<ProfileInformation[] | null> {
    const profile = await queryProfileDB(identifier)
    return toProfileInformation(profile ? [profile] : []).mustNotAwaitThisWithInATransaction
}

/** @deprecated */
export async function hasLocalKey(identifier: ProfileIdentifier) {
    return hasLocalKeyOf(identifier)
}

export async function queryOwnedProfilesInformation(network?: string): Promise<ProfileInformation[]> {
    let profiles: ProfileRecord[]
    await createPersonaDBReadonlyAccess(async (t) => {
        const personas = (await queryPersonasDB({ hasPrivateKey: true }, t)).sort((a, b) =>
            a.updatedAt > b.updatedAt ? 1 : -1,
        )
        const ids = Array.from(new Set(personas.flatMap((x) => [...x.linkedProfiles.keys()])))
        profiles = await queryProfilesDB({ identifiers: ids, network }, t)
    })
    return toProfileInformation(profiles!.filter((x) => x.identifier.network === network))
        .mustNotAwaitThisWithInATransaction
}
