import { MaskMessages, type PersonaIdentifier, type ProfileIdentifier } from '@masknet/shared-base'
import { queryAvatarsDataURL, storeAvatar } from '../../../database/avatar-cache/avatar.js'

export async function getPersonaAvatar(identifier: PersonaIdentifier | null | undefined): Promise<string | undefined> {
    if (!identifier) return undefined
    return queryAvatarsDataURL([identifier]).then((x) => x.get(identifier))
}

export async function getPersonaAvatars(
    identifiers?: PersonaIdentifier[],
): Promise<Map<ProfileIdentifier | PersonaIdentifier, string>> {
    if (!identifiers) return new Map<ProfileIdentifier | PersonaIdentifier, string>()
    return queryAvatarsDataURL(identifiers)
}

export async function updatePersonaAvatar(identifier: PersonaIdentifier | null | undefined, avatar: Blob) {
    if (!identifier) return
    await storeAvatar(identifier, await avatar.arrayBuffer())
    MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}
