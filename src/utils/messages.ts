import { MessageCenter as MC } from '@holoflows/kit/es'
import { Person } from '../extension/background-script/PeopleService'

interface UIEvent {}
interface KeyStoreEvent {
    newPerson: Person
}
interface TypedMessages extends UIEvent, KeyStoreEvent {}

export const MessageCenter = new MC<TypedMessages>('maskbook-events')
MessageCenter.writeToConsole = true
