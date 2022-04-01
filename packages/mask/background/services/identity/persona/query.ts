import { ECKeyIdentifier, PersonaInformation, ProfileInformation } from '@masknet/shared-base'
import { queryAvatarDataURL } from '../../../database/avatar-cache/avatar'
import { queryPersonasDB, queryProfileDB } from '../../../database/persona/db'

export async function queryOwnedPersonaInformation(): Promise<PersonaInformation[]> {
    const personas = await queryPersonasDB({ hasPrivateKey: true })
    const result: PersonaInformation[] = []
    for (const persona of personas.sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1))) {
        const map: ProfileInformation[] = []
        result.push({
            nickname: persona.nickname,
            identifier: persona.identifier,
            linkedProfiles: map,
            publicHexKey: persona.publicHexKey,
        })
        for (const [profile] of persona.linkedProfiles) {
            const linkedProfile = await queryProfileDB(profile)

            map.push({
                identifier: profile,
                nickname: linkedProfile?.nickname,
                avatar: linkedProfile
                    ? await queryAvatarDataURL(linkedProfile.identifier).catch(() => undefined)
                    : undefined,
            })
        }
    }
    return result
}

export async function queryCurrentPersona(): Promise<ECKeyIdentifier | undefined> {
    const id = await queryCurrentPersonaIdentifierUnchecked()
    const owned = await queryOwnedPersonaInformation()

    if (!owned.length) return
    if (!id) return owned[0].identifier

    if (owned.some((x) => x.identifier.equals(id))) return id
    return owned[0].identifier
}

/** @internal */
export async function queryCurrentPersona_internal(owned: PersonaInformation[]) {
    const id = await queryCurrentPersonaIdentifierUnchecked()

    if (!owned.length) return
    if (!id) return owned[0].identifier

    if (owned.some((x) => x.identifier.equals(id))) return id
    return owned[0].identifier
}

async function queryCurrentPersonaIdentifierUnchecked(): Promise<ECKeyIdentifier | undefined> {
    // TODO: This is a hack. We cannot access "settings" API in this TS project. This should be an temporally workaround.
    const raw = 'settings+currentPersonaIdentifier'
    const currentIdentifier = await browser.storage.local.get(raw)
    if (!currentIdentifier[raw]) return
    return ECKeyIdentifier.fromString(String(currentIdentifier[raw]), ECKeyIdentifier).unwrapOr(undefined)
}
