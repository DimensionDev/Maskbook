import type { Appearance, LanguageOptions } from '@masknet/public-api'
import type { SerializableTypedMessages } from '@masknet/typed-message'
import type { ProfileIdentifier, PersonaIdentifier, ECKeyIdentifier } from '@masknet/base'
import type { NetworkPluginID, PluginID } from '../types/PluginID.js'
import type { PersonaInformation, RelationFavor } from '../types/Persona.js'
import type { EnhanceableSite, ExtensionSite } from '../Site/types.js'

export interface MaskSettingsEvents {
    appearanceSettings: Appearance
    telemetrySettings: boolean
    pluginIDSettings: Record<EnhanceableSite | ExtensionSite, NetworkPluginID>
    languageSettings: LanguageOptions
    currentPersonaIdentifier: ECKeyIdentifier | undefined
}
export interface MaskContentScriptEvents {
    // TODO: Maybe in-page UI related messages should use Context instead of messages?
    autoPasteFailed: AutoPasteFailedEvent
    replaceComposition: SerializableTypedMessages
    // TODO: move to plugin message
    profileTabUpdated: ProfileTabEvent
    profileTabHidden: { hidden: boolean }
    postReplacerHidden: postReplacerHiddenEvent
    profileTabActive: { active: boolean }
    NFTAvatarUpdated: NFTAvatarEvent
    nftAvatarSettingDialogUpdated: NFTAvatarSettingDialogEvent
}

export interface MaskEvents extends MaskSettingsEvents, MaskContentScriptEvents {
    telemetryIDReset: string
    /** value is "bulkKey" */
    legacySettings_bulkDiscoverNS: string
    /** emit when the settings changed. */
    legacySettings_set: SettingsUpdateEvent
    /** emit when the settings finished syncing with storage. */
    legacySettings_broadcast: SettingsUpdateEvent
    ownPersonaChanged: void
    ownProofChanged: void
    NFTProjectTwitterDetect: NFTProjectTwitterDetectEvent
    relationsChanged: RelationChangedEvent[]
    pluginMinimalModeChanged: [id: string, newStatus: boolean]
    hostPermissionChanged: void
    personasChanged: void
    allPluginsReady: boolean
    requestExtensionPermission: RequestExtensionPermissionEvent
    personaSignRequest: PersonaSignRequestEvent
    maskSDKHotModuleReload: void
    __kv_backend_persistent__: [string, unknown]
    __kv_backend_in_memory__: [string, unknown]
    popupRouteUpdated: string
    reactQuerySync: any
}

interface UpdateEvent<Data> {
    readonly reason: 'update' | 'delete' | 'new'
    readonly of: Data
}

export interface CompositionDialogEvent {
    readonly reason: 'timeline' | 'popup' | 'reply'
    readonly open: boolean
    readonly content?: SerializableTypedMessages
    readonly options?: {
        initialMeta?: Record<string, unknown>
        target?: EncryptionTargetType
        startupPlugin?: string
        startupPluginProps?: any
        isOpenFromApplicationBoard?: boolean
        pluginMeta?: any
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

export interface ApplicationDialogEvent {
    open: boolean
    pluginID: string
    isVerified?: boolean
    selectedPersona?: PersonaInformation
}

export interface PersonaBindFinishEvent {
    pluginID?: string
}

export interface AvatarSettingsDialogEvent {
    open: boolean
    startPicking?: boolean
}

export interface NFTProjectTwitterDetectEvent {
    address?: string
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
          address?: string
          anchorBounding: DOMRect
          anchorEl: HTMLElement | null
          external?: boolean
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

interface SettingsUpdateEvent {
    key: string
    value: any
}

type FireflySocialProfile = {
    profileId: string
    displayName: string
    handle: string
    fullHandle: string
    pfp: string
    address?: string
    ownedBy?: string
}

interface FireflyContext {
    currentLensProfile?: FireflySocialProfile | null
    currentFarcasterProfile?: FireflySocialProfile | null
}

export interface redpacketDialogEvent {
    open: boolean
    // CompositionType from '@masknet/plugin-infra/content-script'
    compositionType?: 'popup' | 'timeline'
    source?: PluginID
    fireflyContext?: FireflyContext
}

export interface SmartPayDialogEvent {
    open: boolean
}

export interface RenameWalletEvent {
    address?: string
}

export interface FollowLensDialogEvent {
    open: boolean
    handle: string
}

export enum ProfileTabs {
    WEB3 = 'web3',
    DAO = 'dao',
}
interface ProfileTabEvent {
    show: boolean
    type?: ProfileTabs
}

export interface postReplacerHiddenEvent {
    hidden: boolean
    postId: string
}

export interface HideSearchResultInspectorEvent {
    hide: boolean
}
export interface NFTAvatarEvent {
    userId: string
    tokenId?: string
    address?: string
    avatarId: string
    chainId?: number
    schema?: number
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
        chainId?: number
        address?: string
    }
}

export interface SwitchLogoDialogEvent {
    open: boolean
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

export type RelationChangedEvent = UpdateEvent<ProfileIdentifier | PersonaIdentifier> & {
    favor: RelationFavor
}

export interface PersonaSignRequestEvent {
    requestID: string
    selectedPersona?: PersonaIdentifier
}

export interface RequestsUpdatedEvent {
    hasRequest: boolean
}

export type WalletLockStatusUpdatedEvent = boolean

export type PasswordStatusUpdatedEvent = boolean

export interface PopupWalletConnectEvent {
    open: boolean
    uri?: string
}
