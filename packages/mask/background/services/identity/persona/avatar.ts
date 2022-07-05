import type { PersonaIdentifier } from '@masknet/shared-base'
import { MaskMessages } from '../../../../shared/messages'
import { queryAvatarsDataURL, storeAvatar } from '../../../database/avatar-cache/avatar'

export async function getPersonaAvatar(identifier: PersonaIdentifier | null | undefined): Promise<string | undefined> {
    if (!identifier) return undefined
    return queryAvatarsDataURL([identifier]).then((x) => x.get(identifier))
}

export async function updatePersonaAvatar(identifier: PersonaIdentifier | null | undefined, avatar: Blob) {
    if (!identifier) return
    await storeAvatar(identifier, await avatar.arrayBuffer())
    MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}
