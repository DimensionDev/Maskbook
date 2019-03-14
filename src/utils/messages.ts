import { MessageCenter as MC } from '@holoflows/kit/es'

interface UIEvent {}
interface KeyStoreEvent {
    /** New key stored. string = username */
    newKeyStored: string
}
interface TypedMessages extends UIEvent, KeyStoreEvent {}

export const MessageCenter = new MC<TypedMessages>('maskbook-events')
MessageCenter.writeToConsole = true
