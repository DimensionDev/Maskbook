import { MessageCenter as MC } from '@holoflows/kit/es'
import { Person } from '../database'
import { PostIdentifier } from '../database/type'
import Serialization from './type-transform/Serialization'

interface UIEvent {}
interface KeyStoreEvent {
    closeActiveTab: undefined
    newPerson: Person
    generateKeyPair: undefined
    identityUpdated: undefined
    decryptionStatusUpdated: {
        changedPost: PostIdentifier
    }
}
interface TypedMessages extends UIEvent, KeyStoreEvent {}

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
