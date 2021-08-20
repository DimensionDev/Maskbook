// This file should be free of side effects
if (import.meta.webpackHot) import.meta.webpackHot.accept()

import { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import Serialization from './type-transform/Serialization'
import type { ProfileIdentifier, PersonaIdentifier } from '../database/type'
import type { TypedMessage } from '../protocols/typed-message'
import type { ThirdPartyPopupContextIdentifier } from '../plugins/External/popup-context'
import type { SettingsEvents } from '../settings/listener'

// This file is designed as HMR-safe.
import.meta.webpackHot && import.meta.webpackHot.accept()
export interface UpdateEvent<Data> {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Data
}

export interface CompositionRequest {
    readonly reason: 'timeline' | 'popup'
    readonly open: boolean
    readonly content?: TypedMessage
    readonly options?: {
        target?: 'E2E' | 'Everyone'
        startupPlugin?: string
    }
}

export interface SettingsUpdateEvent {
    id: number
    key: string
    value: browser.storage.StorageValue
    initial: boolean
}

export interface ProfileNFTsPageEvent {
    show: boolean
}

export interface MaskMessages extends SettingsEvents {
    // TODO: Maybe in-page UI related messages should use Context instead of messages?
    autoPasteFailed: { text: string; image?: Blob }
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
    requestComposition: CompositionRequest
    personaChanged: (UpdateEvent<PersonaIdentifier> & { owned: boolean })[]
    profilesChanged: UpdateEvent<ProfileIdentifier>[]
    /** Public Key found / Changed */
    linkedProfilesChanged: {
        of: ProfileIdentifier
        before: PersonaIdentifier | undefined
        after: PersonaIdentifier | undefined
    }[]
    // When a SNS page get this event, if it know this context, it should response the challenge with pong.
    thirdPartyPing: { context: ThirdPartyPopupContextIdentifier; challenge: number }
    thirdPartyPong: number
    thirdPartySetPayload: {
        payload: Record<string, unknown>
        appendText: string
        context: ThirdPartyPopupContextIdentifier
    }
    pluginEnabled: string
    pluginDisabled: string

    profileNFTsPageUpdated: ProfileNFTsPageEvent
    profileNFTsTabUpdated: 'reset'
    signRequestApproved: {
        requestID: string
        selectedPersona: PersonaIdentifier
    }
}
export const MaskMessage = new WebExtensionMessage<MaskMessages>({ domain: 'mask' })
Object.assign(globalThis, { MaskMessage })
MaskMessage.serialization = Serialization
