import { MessageCenter as MC } from '@holoflows/kit/es'
import { Group, Person } from '../database'
import Serialization from './type-transform/Serialization'
import { PersonIdentifier, GroupIdentifier } from '../database/type'

export interface PersonUpdateEvent {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Person
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
    newPerson: Person
    generateKeyPair: undefined
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
    peopleChanged: readonly PersonUpdateEvent[]
    joinGroup: {
        group: GroupIdentifier
        newMembers: PersonIdentifier[]
    }
    startCompose: undefined
    finishCompose: undefined
    cancelCompose: undefined
}
export const MessageCenter = new MC<MaskbookMessages>('maskbook-events')
MessageCenter.serialization = Serialization
