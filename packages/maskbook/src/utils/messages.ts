import { MessageCenter as MC, WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { Profile } from '../database'
import Serialization from './type-transform/Serialization'
import type { ProfileIdentifier, GroupIdentifier, PersonaIdentifier } from '../database/type'

export interface UpdateEvent<Data> {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Data
}

export interface CompositionEvent {
    readonly reason: 'timeline' | 'popup'
    readonly open: boolean
    readonly content?: string
    readonly options?: {
        onlyMySelf?: boolean
        shareToEveryOne?: boolean
    }
}

interface DeprecatedMaskbookMessages {
    /** emit when my personas updated */
    personaUpdated: undefined
    /** emit people changed in the database */
    profilesChanged: readonly UpdateEvent<Profile>[]
    /** Public Key found / Changed */
    linkedProfileChanged: {
        of: ProfileIdentifier
        before: PersonaIdentifier | undefined
        after: PersonaIdentifier | undefined
    }
}
export class BatchedMessageCenter<T> extends MC<T> {
    private buffer = new Map<keyof T, T[keyof T][]>()
    private timeout: number = null!
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
/** @deprecated migrate to WebExtensionMessage based */
export const MessageCenter = new BatchedMessageCenter<DeprecatedMaskbookMessages>(true, 'maskbook-events')
MessageCenter.serialization = Serialization
export interface SettingsUpdateEvent {
    id: number
    key: string
    value: browser.storage.StorageValue
    initial: boolean
    context: string
}

export interface MaskMessages {
    // TODO: Maybe in-page UI related messages should use Context instead of messages?
    autoPasteFailed: {
        text: string
        image?: Blob
    }
    /**
     * Only used by createNetworkSettings.
     * value is "networkKey"
     */
    createNetworkSettingsReady: string
    // TODO: Document what difference between changed and updated.
    /** emit when the settings changed. */
    createInternalSettingsChanged: SettingsUpdateEvent
    /** emit when the settings finished syncing with storage. */
    createInternalSettingsUpdated: SettingsUpdateEvent
    ownedPersonaCreated: void
    ownedPersonaUpdated: void
    profileJoinedGroup: {
        group: GroupIdentifier
        newMembers: ProfileIdentifier[]
    }
    /** emit when compose status updated. */
    // TODO: Maybe in-page UI related messages should use Context instead of messages?
    compositionUpdated: CompositionEvent
    browserPermissionUpdated: void
    metamaskDisconnected: void
}
export const MaskMessage = new WebExtensionMessage<MaskMessages>({ domain: 'maskbook' })
MaskMessage.serialization = Serialization
