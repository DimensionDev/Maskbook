import type { PersonaInformation, ProfileInformation } from '@masknet/shared-base'
import { noop } from 'lodash-es'
import { queryAvatarsDataURL } from '../../database/avatar-cache/avatar.js'
import {
    type FullPersonaDBTransaction,
    type PersonaRecord,
    type ProfileRecord,
    queryProfilesDB,
} from '../../database/persona/db.js'

/** @internal */
export function toProfileInformation(profiles: ProfileRecord[]) {
    return {
        mustNotAwaitThisWithInATransaction: (async () => {
            const result: ProfileInformation[] = []
            for (const profile of profiles) {
                result.push({
                    identifier: profile.identifier,
                    nickname: profile.nickname,
                    linkedPersona: profile.linkedPersona,
                    createAt: profile.createdAt,
                })
            }

            const avatars = await queryAvatarsDataURL(result.map((x) => x.identifier))
            result.forEach((x) => avatars.has(x.identifier) && (x.avatar = avatars.get(x.identifier)))
            return result
        })(),
    }
}

/** @internal */
export function toPersonaInformation(personas: PersonaRecord[], t: FullPersonaDBTransaction<'readonly'>) {
    const personaInfo: PersonaInformation[] = []
    const dbQueryPass2: Array<Promise<void>> = []
    const dbQuery: Array<Promise<void>> = personas.map(async (persona) => {
        const map: ProfileInformation[] = []
        personaInfo.push({
            nickname: persona.nickname,
            identifier: persona.identifier,
            address: persona.address,
            linkedProfiles: map,
        })

        if (persona.linkedProfiles.size) {
            const profiles = await queryProfilesDB({ identifiers: [...persona.linkedProfiles.keys()] }, t)
            // we must not await toProfileInformation cause it is tx of another db.
            dbQueryPass2.push(
                toProfileInformation(profiles).mustNotAwaitThisWithInATransaction.then((x) => void map.push(...x)),
            )
        }
    })
    dbQueryPass2.push(
        queryAvatarsDataURL(personas.map((x) => x.identifier))
            .then((avatars) => {
                for (const [id, avatar] of avatars) {
                    const info = personaInfo.find((x) => x.identifier === id)
                    if (info) info.avatar = avatar
                }
            })
            .catch(noop),
    )

    return {
        // we have to split two arrays for them and await them one by one, otherwise it will be race condition
        mustNotAwaitThisWithInATransaction: Promise.all(dbQuery)
            .then(() => Promise.all(dbQueryPass2))
            .then(() => personaInfo),
    }
}
