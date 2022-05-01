import type { MobileProfile } from '@masknet/public-api'
import type { ProfileIdentifier, ProfileInformation } from '@masknet/shared-base'
import {
    createPersonaDBReadonlyAccess,
    ProfileRecord,
    queryPersonasDB,
    queryProfilesDB,
} from '../../../database/persona/db'
import { hasLocalKeyOf } from '../../../database/persona/helper'
import { queryProfilesDB as queryProfilesFromIndexedDB } from '../../../database/persona/web'
import { toProfileInformation } from '../../__utils__/convert'
import { profileRecordToMobileProfile } from './mobile'

export interface MobileQueryProfilesOptions {
    network?: string
    identifiers?: ProfileIdentifier[]
}
export async function mobile_queryProfiles(options: MobileQueryProfilesOptions): Promise<MobileProfile[]> {
    if (process.env.architecture !== 'app') throw new TypeError('This function is only available in app')

    const { network, identifiers } = options
    const result = await queryProfilesDB({ network, identifiers })
    return result.map(profileRecordToMobileProfile)
}

export async function mobile_queryOwnedProfiles(network?: string): Promise<MobileProfile[]> {
    let result: ProfileRecord[]
    await createPersonaDBReadonlyAccess(async (t) => {
        const personas = await queryPersonasDB({ hasPrivateKey: true }, t)
        const profiles = personas
            .filter((x) => !x.uninitialized)
            .flatMap((x) => [...x.linkedProfiles.keys()])
            .filter((x) => (network ? x.network === network : true))
        result = await queryProfilesDB({ identifiers: profiles })
    })
    return result!.map(profileRecordToMobileProfile)
}

export async function mobile_queryProfileRecordFromIndexedDB() {
    if (process.env.architecture !== 'app') throw new TypeError('This function is only available in app')
    return queryProfilesFromIndexedDB({})
}

export async function queryProfilesInformation(identifiers: ProfileIdentifier[]): Promise<ProfileInformation[]> {
    const profiles = await queryProfilesDB({ identifiers })
    return toProfileInformation(profiles).mustNotAwaitThisWithInATransaction
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
