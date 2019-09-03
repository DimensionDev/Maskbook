import { MessageCenter as MC } from '@holoflows/kit/es'
import { Person } from '../database'
import { PostIVIdentifier } from '../database/type'
import Serialization from './type-transform/Serialization'

interface UIEvent {
    decryptionStatusUpdated: {
        post: PostIVIdentifier
        status: 'finding_person_public_key' | 'finding_post_key' | 'found_person_public_key' | 'new_post_key'
    }
    closeActiveTab: undefined
}
interface KeyStoreEvent {
    newPerson: Person
    generateKeyPair: undefined
    identityUpdated: undefined
}
export interface TypedMessages extends UIEvent, KeyStoreEvent {}
export const MessageCenter = new MC<TypedMessages>('maskbook-events')
MessageCenter.serialization = Serialization
