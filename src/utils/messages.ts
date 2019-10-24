import { MessageCenter as MC } from '@holoflows/kit/es'
import { Group, Person } from '../database'
import Serialization from './type-transform/Serialization'
import { PersonIdentifier } from '../database/type'

export interface PersonUpdateEvent {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Person
}
interface MaskbookMessages {
    /**
     * Used to polyfill window.close in iOS and Android.
     */
    closeActiveTab: undefined
    settingsCreated: string
    newPerson: Person
    generateKeyPair: undefined
    /**
     * broadcast the settings updating
     */
    settingsUpdated: string
    /**
     * broadcast my identities updating
     */
    identityUpdated: undefined
    /**
     * broadcast people changed in the database
     */
    peopleChanged: readonly PersonUpdateEvent[]
    newGroup: Group
    joinGroup: PersonIdentifier
}
export const MessageCenter = new MC<MaskbookMessages>('maskbook-events')
MessageCenter.serialization = Serialization
