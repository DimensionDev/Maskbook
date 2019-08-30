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

class Channel<T> extends MC<T> {
    emit<Key extends keyof T>(key: Key, data: T[Key]) {
        console.log('Emit broadcast', key, data)
        Serialization.serialization(data).then(data => {
            super.emit(key, data as any)
        })
    }
    on<Key extends keyof T>(event: Key, handler: (data: T[Key]) => void): void {
        const handlerWrapped = (data: any) =>
            Serialization.deserialization(data).then(data => {
                console.log('Receive broadcast', event, data)
                handler(data)
            })
        handlerWrapped.raw = handler
        super.on(event, handlerWrapped)
    }
}
export const MessageCenter = new Channel<TypedMessages>('maskbook-events')
