import type { TypedMessage } from '../TypedMessage'
import type { ProfileIdentifier, PersonaIdentifier } from '../Identifier/type'
import type { RelationFavor } from '../Persona/type'
import type { Appearance, LanguageOptions, TradeProvider, DataProvider } from '../../../public-api/src/web'
import type {
    CryptoPrice,
    NetworkType,
    ProviderType,
    PortfolioProvider,
    CollectibleProvider,
} from '../../../web3-shared/evm'

export interface MaskSettingsEvents {
    appearanceSettings: Appearance
    languageSettings: LanguageOptions
    debugModeSetting: boolean
    pluginIDSettings: string
    networkIDSettings: string
    currentChainIdSettings: number
    currentBalanceSettings: string
    currentBlockNumberSettings: number
    currentTokenPricesSettings: CryptoPrice
    currentDataProviderSettings: DataProvider
    currentProviderSettings: ProviderType
    currentNetworkSettings: NetworkType
    currentAccountSettings: string
    currentPortfolioDataProviderSettings: PortfolioProvider
    currentCollectibleDataProviderSettings: CollectibleProvider
    currentPersonaIdentifier: string
    ethereumNetworkTradeProviderSettings: TradeProvider
    polygonNetworkTradeProviderSettings: TradeProvider
    binanceNetworkTradeProviderSettings: TradeProvider
    arbitrumNetworkTradeProviderSettings: TradeProvider
    xdaiNetworkTradeProviderSettings: TradeProvider
}

export interface MaskMobileOnlyEvents {
    mobile_app_suspended: void
    mobile_app_resumed: void
}

export interface MaskSNSEvents {
    // TODO: Maybe in-page UI related messages should use Context instead of messages?
    autoPasteFailed: AutoPasteFailedEvent
    requestComposition: CompositionRequest
    replaceComposition: TypedMessage
    // TODO: move to plugin message
    profileNFTsPageUpdated: ProfileNFTsPageEvent
    // TODO: move to plugin message
    profileNFTsTabUpdated: 'reset'
    NFTAvatarUpdated: NFTAvatarEvent
    NFTAvatarTimelineUpdated: NFTAvatarEvent
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
    restoreSuccess: void
    profilesChanged: UpdateEvent<ProfileIdentifier>[]
    relationsChanged: RelationChangedEvent[]
    pluginEnabled: string
    pluginDisabled: string

    requestExtensionPermission: RequestExtensionPermissionEvent
    signRequestApproved: PersonaSignApprovedEvent
    maskSDKHotModuleReload: void
}

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
    value: any
    initial: boolean
}

export interface ProfileNFTsPageEvent {
    show: boolean
}

export interface NFTAvatarEvent {
    userId: string
    avatarId: string
    address?: string
    tokenId?: string
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

export interface PersonaSignApprovedEvent {
    requestID: string
    selectedPersona: PersonaIdentifier
}
