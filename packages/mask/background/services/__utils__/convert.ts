import type { PersonaInformation, ProfileInformation } from '@masknet/shared-base'
import { queryAvatarsDataURL } from '../../database/avatar-cache/avatar'
import { FullPersonaDBTransaction, PersonaRecord, ProfileRecord, queryProfilesDB } from '../../database/persona/db'

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
    const dbQueryPass2: Promise<void>[] = []
    const dbQuery: Promise<void>[] = personas.map(async (persona) => {
        const map: ProfileInformation[] = []
        personaInfo.push({
            nickname: persona.nickname,
            identifier: persona.identifier,
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

    return {
        // we have to split two arrays for them and await them one by one, otherwise it will be race condition
        mustNotAwaitThisWithInATransaction: Promise.all(dbQuery)
            .then(() => Promise.all(dbQueryPass2))
            .then(() => personaInfo),
    }
}
