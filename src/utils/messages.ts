import { MessageCenter as MC } from '@holoflows/kit/es'
import { Person, Group } from '../database'
import Serialization from './type-transform/Serialization'

interface UIEvent {
    closeActiveTab: undefined
    settingsUpdated: undefined
}
interface KeyStoreEvent {
    newGroup: Group
    newPerson: Person
    peopleChanged: undefined
    generateKeyPair: undefined
    identityUpdated: undefined
}
export interface TypedMessages extends UIEvent, KeyStoreEvent {}
export const MessageCenter = new MC<TypedMessages>('maskbook-events')
MessageCenter.serialization = Serialization
MessageCenter.on('newPerson', () => MessageCenter.emit('peopleChanged', undefined))
