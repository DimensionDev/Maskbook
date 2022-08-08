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

// Learn more about ethereum ChainId https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
export enum ChainId {
    // Mainnet
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Gorli = 5,
    Kovan = 42,

    // BSC
    BSC = 56,
    BSCT = 97,

    // Matic
    Matic = 137,
    Mumbai = 80001,

    // Arbitrum
    Arbitrum = 42161,
    Arbitrum_Rinkeby = 421611,

    // xDai
    xDai = 100,

    // Avalanche
    Avalanche = 43114,
    Avalanche_Fuji = 43113,

    // Celo
    Celo = 42220,

    // Fantom
    Fantom = 250,

    // Aurora
    Aurora = 1313161554,
    Aurora_Testnet = 1313161555,

    // Fuse
    Fuse = 122,

    // Boba
    Boba = 288,

    // Metis
    Metis = 1088,

    // Optimism
    Optimism = 10,
    Optimism_Kovan = 69,
    Optimism_Goerli = 420,

    // Harmony
    Harmony = 1666600000,
    Harmony_Test = 1666700000,

    // Conflux
    Conflux = 1030,

    // Astar
    Astar = 592,
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

export interface Web3ProfileDialogRequest {
    open: boolean
}

export interface CheckSecurityCloseConfirmDialogRequest {
    open: boolean
}

export interface CheckSecurityDialogRequest {
    open: boolean
    searchHidden: boolean
    tokenAddress?: string
    chainId?: ChainId
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
