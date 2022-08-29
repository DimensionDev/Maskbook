import type { Appearance, LanguageOptions } from '@masknet/public-api'
import type { SerializableTypedMessages } from '@masknet/typed-message'
import type { ProfileIdentifier, PersonaIdentifier } from '../Identifier/index.js'
import type { RelationFavor } from '../Persona/type.js'
import type { EnhanceableSite, ExtensionSite } from '../Site/index.js'

enum NetworkPluginID {
    PLUGIN_EVM = 'com.mask.evm',
    PLUGIN_FLOW = 'com.mask.flow',
    PLUGIN_SOLANA = 'com.mask.solana',
}

export interface MaskSettingsEvents {
    appearanceSettings: Appearance
    pluginIDSettings: Record<EnhanceableSite | ExtensionSite, NetworkPluginID>
    languageSettings: LanguageOptions
    currentPersonaIdentifier: string
}

export interface MaskMobileOnlyEvents {
    mobile_app_suspended: void
    mobile_app_resumed: void
}

export interface MaskSNSEvents {
    // TODO: Maybe in-page UI related messages should use Context instead of messages?
    autoPasteFailed: AutoPasteFailedEvent
    replaceComposition: SerializableTypedMessages
    // TODO: move to plugin message
    profileTabUpdated: ProfileNFTsPageEvent
    profileTabHidden: { hidden: boolean }
    profileTabActive: { active: boolean }
    NFTAvatarUpdated: NFTAvatarEvent
    NFTAvatarTimelineUpdated: NFTAvatarEvent
    nftAvatarSettingDialogUpdated: NFTAvatarSettingDialogEvent
    Native_visibleSNS_currentDetectedProfileUpdated: ProfileIdentifier
}

export interface MaskEvents extends MaskSettingsEvents, MaskMobileOnlyEvents, MaskSNSEvents {
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
    ownPersonaChanged: void
    ownProofChanged: void
    restoreSuccess: void
    relationsChanged: RelationChangedEvent[]
    pluginMinimalModeChanged: [id: string, newStatus: boolean]

    requestExtensionPermission: RequestExtensionPermissionEvent
    personaSignRequest: PersonaSignRequestEvent
    maskSDKHotModuleReload: void
    __kv_backend_persistent__: [string, unknown]
    __kv_backend_in_memory__: [string, unknown]
    /** @deprecated do not use it in new code. */
    wallet_is_locked: ['request'] | ['response', boolean]

    /** emit when open new page . */
    openPageConfirm: OpenPageConfirmEvent
}

export interface UpdateEvent<Data> {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Data
}

export interface CompositionRequest {
    readonly reason: 'timeline' | 'popup' | 'reply'
    readonly open: boolean
    readonly content?: SerializableTypedMessages
    readonly options?: {
        target?: EncryptionTargetType
        startupPlugin?: string
        isOpenFromApplicationBoard?: boolean
    }
}
export enum EncryptionTargetType {
    Public = 'public',
    Self = 'self',
    E2E = 'e2e',
}

export interface NFTAvatarSettingDialogEvent {
    open: boolean
}

export interface SettingsUpdateEvent {
    id: number
    key: string
    value: any
    initial: boolean
}

export interface ProfileNFTsPageEvent {
    show: boolean
}

export interface OpenPageConfirmEvent {
    open: boolean
    target: 'dashboard' | 'other'
    url: string
    title: string
    text: string
    actionHint: string
    position?: 'center' | 'top-right'
}

export interface Web3ProfileDialogRequest {
    open: boolean
}

export interface CheckSecurityCloseConfirmDialogRequest {
    open: boolean
}
export type OpenApplicationRequestEvent = {
    open: boolean
    application: string
}

export type OpenProfileCardEvent = {
    userId: string
    x: number
    y: number
}

export type CheckSecurityDialogRequest =
    | {
          open: true
          searchHidden: boolean
          tokenAddress?: string
          chainId?: number
      }
    | {
          open: false
      }

export interface NFTAvatarEvent {
    userId: string
    avatarId: string
    address?: string
    tokenId?: string
    schema?: number
    chainId?: number
    pluginId?: string
}

export interface TokenType {
    name: string
    symbol: string
    address: string
    decimals?: number
}
export interface SwapDialogEvent {
    open: boolean
    traderProps?: {
        defaultInputCoin?: TokenType
        defaultOutputCoin?: TokenType
        chainId?: number
    }
}

export interface SettingDialogEvent {
    open: boolean
}

/** This is a subset of browser.permissions.Permission */
export type PossiblyUsedWebExtensionPermission = 'clipboardRead'

export interface RequestExtensionPermissionEvent {
    permissions?: PossiblyUsedWebExtensionPermission[]
}

export interface AutoPasteFailedEvent {
    text: string
    image?: Blob
}

export type RelationChangedEvent = UpdateEvent<ProfileIdentifier> & {
    favor: RelationFavor
}

export interface PersonaSignRequestEvent {
    requestID: string
    selectedPersona?: PersonaIdentifier
}
