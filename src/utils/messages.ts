import { MessageCenter as MC } from '@holoflows/kit/es'
import { Profile, Group } from '../database'
import Serialization from './type-transform/Serialization'
import { ProfileIdentifier, GroupIdentifier } from '../database/type'

export interface UpdateEvent<Data> {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Data
}

export interface CompositionEvent {
    readonly reason: 'timeline' | 'popup'
    readonly open: boolean
}

interface MaskbookMessages {
    /**
     * Used to polyfill window.close in iOS and Android.
     */
    closeActiveTab: undefined
    /**
     * emit when a settings created.
     * value is instanceKey
     */
    settingsCreated: string
    /**
     * emit when the settings updated.
     * value is instanceKey
     */
    settingsUpdated: string
    /**
     * emit when my identities created.
     */
    identityCreated: undefined
    /**
     * emit when my identities updated.
     */
    identityUpdated: undefined
    /**
     * emit people changed in the database.
     */
    profilesChanged: readonly UpdateEvent<Profile>[]
    groupsChanged: readonly UpdateEvent<Group>[]
    joinGroup: {
        group: GroupIdentifier
        newMembers: ProfileIdentifier[]
    }
    /**
     * emit when compose status updated.
     */
    compositionUpdated: CompositionEvent
}
export const MessageCenter = new MC<MaskbookMessages>('maskbook-events')
MessageCenter.serialization = Serialization
