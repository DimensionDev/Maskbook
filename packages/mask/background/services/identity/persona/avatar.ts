import type { PersonaIdentifier } from '@masknet/shared-base'
import { noop } from 'lodash-unified'
import { MaskMessages } from '../../../../shared/messages'
import { queryAvatarDataURL, storeAvatar } from '../../../database/avatar-cache/avatar'

export async function getPersonaAvatar(identifier: PersonaIdentifier | null | undefined) {
    if (!identifier) return null
    return queryAvatarDataURL(identifier).catch(noop)
}

export async function updatePersonaAvatar(identifier: PersonaIdentifier | null | undefined, avatar: Blob) {
    if (!identifier) return
    await storeAvatar(identifier, await avatar.arrayBuffer())
    MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
}
