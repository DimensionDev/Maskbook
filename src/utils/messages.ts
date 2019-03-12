import { MessageCenter as MC } from '@holoflows/kit/es'
import { CryptoKeyRecord } from '../key-management/db'

interface UIEvent {
    requireSaveKeypair: CryptoKeyRecord
}
interface KeyStoreEvent {
    /** New key stored. string = username */
    newKeyStored: string
}
interface TypedMessages extends UIEvent, KeyStoreEvent {}

export const MessageCenter = new MC<TypedMessages>()
MessageCenter.writeToConsole = true
