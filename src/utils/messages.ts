import { MessageCenter as MC, OnlyRunInContext } from '@holoflows/kit/es'
import { Person, personRecordToPerson } from '../database'
import { PersonRecord } from '../database/people'

interface UIEvent {}
interface KeyStoreEvent {
    newPerson: Person
}
interface TypedMessages extends UIEvent, KeyStoreEvent {}

export const MessageCenter = new MC<TypedMessages>('maskbook-events')
export async function sendNewPersonMessageDB(personRecord: PersonRecord) {
    OnlyRunInContext(['background', 'debugging'], 'sendNewPersonDB')
    MessageCenter.send('newPerson', await personRecordToPerson(personRecord))
}
MessageCenter.writeToConsole = true
