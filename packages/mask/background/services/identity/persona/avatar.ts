import type { PersonaIdentifier } from '@masknet/shared-base'
import { MaskMessages } from '../../../../shared/messages'
import { queryAvatarDataURL, storeAvatar } from '../../../database/avatar-cache/avatar'

export async function getPersonaAvatar(identifier: PersonaIdentifier | null | undefined) {
    if (!identifier) return
    return queryAvatarDataURL(identifier).catch(() => undefined)
}

export async function updatePersonaAvatar(identifier: PersonaIdentifier | null | undefined, avatar: Blob) {
    if (!identifier) return
    await storeAvatar(identifier, await avatar.arrayBuffer())
    MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}
