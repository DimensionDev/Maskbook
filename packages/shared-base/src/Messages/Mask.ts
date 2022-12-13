import type { Appearance, LanguageOptions } from '@masknet/public-api'
import type { SerializableTypedMessages } from '@masknet/typed-message'
import type { ProfileIdentifier, PersonaIdentifier } from '@masknet/base'
import type { NetworkPluginID } from '../Plugin/index.js'
import type { RelationFavor } from '../Persona/type.js'
import type { EnhanceableSite, ExtensionSite } from '../Site/index.js'

export type PersonaSelectPanelDialogEvent = {
    open: boolean
    target?: string
    position?: 'center' | 'top-right'
    enableVerify: boolean
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
    /** value is "bulkKey" */
    legacySettings_bulkDiscoverNS: string
    /** emit when the settings changed. */
    legacySettings_set: SettingsUpdateEvent
    /** emit when the settings finished syncing with storage. */
    legacySettings_broadcast: SettingsUpdateEvent
    ownPersonaChanged: void
    ownProofChanged: void
    restoreSuccess: void
    relationsChanged: RelationChangedEvent[]
    pluginMinimalModeChanged: [id: string, newStatus: boolean]
    hostPermissionChanged: void

    requestExtensionPermission: RequestExtensionPermissionEvent
    personaSignRequest: PersonaSignRequestEvent
    maskSDKHotModuleReload: void
    __kv_backend_persistent__: [string, unknown]
    __kv_backend_in_memory__: [string, unknown]
    /** @deprecated do not use it in new code. */
    wallet_is_locked: ['request'] | ['response', boolean]
}

export interface UpdateEvent<Data> {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Data
}

export interface CompositionDialogEvent {
    readonly reason: 'timeline' | 'popup' | 'reply'
    readonly open: boolean
    readonly content?: SerializableTypedMessages
    readonly options?: {
        initialMetas?: Record<string, unknown>
        target?: EncryptionTargetType
        startupPlugin?: string
        startupPluginProps?: any
        isOpenFromApplicationBoard?: boolean
    }
}

export interface Web3ProfileDialogEvent {
    open: boolean
}

export interface CheckSecurityConfirmationDialogEvent {
    open: boolean
}

export type CheckSecurityDialogEvent =
    | {
          open: true
          searchHidden: boolean
          tokenAddress?: string
          chainId?: number
      }
    | {
          open: false
      }

export type ApplicationDialogEvent = {
    open: boolean
    pluginID: string
}

export interface SettingsDialogEvent {
    open: boolean
    targetTab?: string
}

export type ProfileCardEvent =
    | {
          open: false
      }
    | {
          open: true
          userId: string
          badgeBounding: DOMRect
      }

export type NonFungibleTokenDialogEvent =
    | {
          open: true
          pluginID: NetworkPluginID
          chainId: number
          tokenId: string
          tokenAddress: string
          ownerAddress?: string
          origin?: 'pfp' | 'web3-profile-card' | 'web3-profile-tab' | 'unknown'
      }
    | {
          open: false
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
    key: string
    value: any
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

export interface NFTAvatarEvent {
    userId: string
    avatarId: string
    address?: string
    tokenId?: string
    schema?: number
    chainId?: number
    pluginID?: NetworkPluginID
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

export interface WalletSettingsDialogEvent {
    pluginID?: string
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
