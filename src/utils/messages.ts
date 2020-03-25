import { MessageCenter as MC } from '@holoflows/kit'
import type { Profile, Group } from '../database'
import Serialization from './type-transform/Serialization'
import type { ProfileIdentifier, GroupIdentifier, PersonaIdentifier } from '../database/type'

export interface UpdateEvent<Data> {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Data
}

export interface CompositionEvent {
    readonly reason: 'timeline' | 'popup'
    readonly open: boolean
}

interface MaskbookMessages {
    /**
     * Used to polyfill window.close in iOS and Android.
     */
    closeActiveTab: undefined
    /**
     * emit when a settings created.
     * value is instanceKey
     */
    settingsCreated: string
    /**
     * emit when the settings updated.
     * value is instanceKey
     */
    settingsUpdated: string
    /**
     * emit when my identities created.
     */
    identityCreated: undefined
    /**
     * emit when my identities updated.
     */
    identityUpdated: undefined
    /**
     * emit people changed in the database.
     * emit when my personas created
     */
    personaCreated: undefined
    /**
     * emit when my personas updated
     */
    personaUpdated: undefined
    /**
     * emit people changed in the database
     */
    profilesChanged: readonly UpdateEvent<Profile>[]
    groupsChanged: readonly UpdateEvent<Group>[]
    joinGroup: {
        group: GroupIdentifier
        newMembers: ProfileIdentifier[]
    }
    /**
     * emit when compose status updated.
     */
    compositionUpdated: CompositionEvent
    /**
     * Public Key found / Changed
     */
    linkedProfileChanged: {
        of: ProfileIdentifier
        before: PersonaIdentifier | undefined
        after: PersonaIdentifier | undefined
    }
}

export class BatchedMessageCenter<T> extends MC<T> {
    buffer = new Map<keyof T, T[keyof T][]>()
    timeout: number = null!
    private policy: 'normal' | 'batch' = 'normal'
    private flushBuffer() {
        for (const [key, datas] of this.buffer.entries()) {
            for (const data of datas) super.emit(key, data)
        }
        this.buffer.clear()
    }
    emit(key: keyof T, data: T[keyof T]) {
        if (this.policy === 'normal') return super.emit(key, data)
        const buffer = this.buffer
        const queue = buffer.get(key) ?? []
        if (!queue.includes(data)) {
            if (Array.isArray(data) && Array.isArray(queue[0])) queue[0].concat(data)
            else queue.push(data)
            buffer.set(key, queue)
            window.clearTimeout(this.timeout)
            this.timeout = window.setTimeout(() => {
                this.flushBuffer()
            }, 1000)
        }
        return Promise.resolve()
    }
    startBatch() {
        this.policy = 'batch'
    }
    commitBatch() {
        window.clearTimeout(this.timeout)
        this.flushBuffer()
        this.policy = 'normal'
    }
}

export const MessageCenter = new BatchedMessageCenter<MaskbookMessages>(true, 'maskbook-events')

MessageCenter.serialization = Serialization
