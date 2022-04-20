import type { ProfileIdentifier } from '@masknet/shared-base'
import { queryProfilesDB } from '../../../database/persona/db'
import { hasLocalKeyOf } from '../../../database/persona/helper'
import { queryProfilesDB as queryProfilesFromIndexedDB } from '../../../database/persona/web'

export interface MobileProfiles {
    identifier: ProfileIdentifier
    nickname?: string
    linkedPersona: boolean
    createdAt: Date
    updatedAt: Date
}
export async function mobile_queryProfiles(network?: string): Promise<MobileProfiles[]> {
    if (process.env.architecture !== 'app') throw new TypeError('This function is only available in app')
    const result = await queryProfilesDB({ network })

    return result.map(
        (x): MobileProfiles => ({
            identifier: x.identifier,
            createdAt: x.createdAt,
            updatedAt: x.updatedAt,
            linkedPersona: !!x.linkedPersona,
            nickname: x.nickname,
        }),
    )
}

export async function mobile_queryProfileRecordFromIndexedDB() {
    if (process.env.architecture !== 'app') throw new TypeError('This function is only available in app')
    return queryProfilesFromIndexedDB({})
}

/** @deprecated */
export async function hasLocalKey(identifier: ProfileIdentifier) {
    return hasLocalKeyOf(identifier)
}
