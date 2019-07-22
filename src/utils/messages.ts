import { MessageCenter as MC } from '@holoflows/kit/es'
import { Person } from '../database'

interface UIEvent {}
interface KeyStoreEvent {
    newPerson: Person
    generateKeyPair: undefined
}
interface TypedMessages extends UIEvent, KeyStoreEvent {}

export const MessageCenter = new MC<TypedMessages>('maskbook-events')
MessageCenter.writeToConsole = true
