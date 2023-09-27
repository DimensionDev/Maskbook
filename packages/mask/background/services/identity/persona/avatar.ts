import { MaskMessages, type PersonaIdentifier, type ProfileIdentifier } from '@masknet/shared-base'
import { queryAvatarLastUpdateTime, queryAvatarsDataURL, storeAvatar } from '../../../database/avatar-cache/avatar.js'

export async function getPersonaAvatar(identifiers: undefined | PersonaIdentifier): Promise<string | undefined>
export async function getPersonaAvatar(
    identifiers: readonly PersonaIdentifier[],
): Promise<Map<ProfileIdentifier | PersonaIdentifier, string>>
export async function getPersonaAvatar(
    identifiers: undefined | PersonaIdentifier | readonly PersonaIdentifier[],
): Promise<string | undefined | Map<ProfileIdentifier | PersonaIdentifier, string>> {
    if (!identifiers) return undefined
    // Array.isArray cannot guard for readonly array.
    // eslint-disable-next-line @masknet/type-no-instanceof-wrapper
    const map = await queryAvatarsDataURL(identifiers instanceof Array ? identifiers : [identifiers])
    // eslint-disable-next-line @masknet/type-no-instanceof-wrapper
    if (identifiers instanceof Array) return map
    return map.get(identifiers)
}

export async function getPersonaAvatarLastUpdateTime(identifier?: PersonaIdentifier | null) {
    if (!identifier) return undefined
    return queryAvatarLastUpdateTime(identifier)
}

export async function updatePersonaAvatar(identifier: PersonaIdentifier | null | undefined, avatar: Blob) {
    if (!identifier) return
    await storeAvatar(identifier, await avatar.arrayBuffer())
    MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}
