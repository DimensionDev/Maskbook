import { MessageCenter as MC } from '@holoflows/kit/es'
import { Profile } from '../database'
import Serialization from './type-transform/Serialization'
import { ProfileIdentifier, GroupIdentifier } from '../database/type'

export interface UpdateEvent<Data> {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Data
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
     * emit when my identities created
     */
    identityCreated: undefined
    /**
     * emit when my identities updated
     */
    identityUpdated: undefined
    /**
     * emit people changed in the database
     */
    profilesChanged: readonly UpdateEvent<Profile>[]
    joinGroup: {
        group: GroupIdentifier
        newMembers: ProfileIdentifier[]
    }
}
export const MessageCenter = new MC<MaskbookMessages>('maskbook-events')
MessageCenter.serialization = Serialization
