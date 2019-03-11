import { MessageCenter as MC } from '@holoflows/kit/es'
import { PersonCryptoKey } from '../key-management/db'

interface UIEvent {
    requireSaveKeypair: string
    responseSaveKeypair: string
}
interface KeyStoreEvent {
    /** New key stored. string = username */
    newKeyStored: string
}
interface TypedMessages extends UIEvent, KeyStoreEvent {}

export const MessageCenter = new MC<TypedMessages>()
MessageCenter.writeToConsole = true
MessageCenter.on('requireSaveKeypair', m => {
    MessageCenter.send('responseSaveKeypair', 'ACK:' + m)
})
