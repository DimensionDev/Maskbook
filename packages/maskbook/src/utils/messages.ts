import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import Serialization from './type-transform/Serialization'
import type { ProfileIdentifier, GroupIdentifier, PersonaIdentifier } from '../database/type'

export interface UpdateEvent<Data> {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Data
}

export interface CompositionEvent {
    readonly reason: 'timeline' | 'popup'
    readonly open: boolean
    readonly content?: string
    readonly options?: {
        onlyMySelf?: boolean
        shareToEveryOne?: boolean
    }
}

export interface SettingsUpdateEvent {
    id: number
    key: string
    value: browser.storage.StorageValue
    initial: boolean
    context: string
}

export interface MaskMessages {
    // TODO: Maybe in-page UI related messages should use Context instead of messages?
    autoPasteFailed: { text: string; image?: Blob }
    /**
     * Only used by createNetworkSettings.
     * value is "networkKey"
     */
    createNetworkSettingsReady: string
    // TODO: Document what difference between changed and updated.
    /** emit when the settings changed. */
    createInternalSettingsChanged: SettingsUpdateEvent
    /** emit when the settings finished syncing with storage. */
    createInternalSettingsUpdated: SettingsUpdateEvent
    profileJoinedGroup: { group: GroupIdentifier; newMembers: ProfileIdentifier[] }
    /** emit when compose status updated. */
    // TODO: Maybe in-page UI related messages should use Context instead of messages?
    compositionUpdated: CompositionEvent
    browserPermissionUpdated: void
    metamaskDisconnected: void
    personaChanged: (UpdateEvent<PersonaIdentifier> & { owned: boolean })[]
    profilesChanged: UpdateEvent<ProfileIdentifier>[]
    /** Public Key found / Changed */
    linkedProfilesChanged: {
        of: ProfileIdentifier
        before: PersonaIdentifier | undefined
        after: PersonaIdentifier | undefined
    }[]
}
export const MaskMessage = new WebExtensionMessage<MaskMessages>({ domain: 'mask' })
MaskMessage.serialization = Serialization
