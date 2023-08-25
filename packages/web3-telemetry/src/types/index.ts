import type { NetworkPluginID, PluginID } from '@masknet/shared-base'

export enum GroupID {
    Event = 'event',
    Exception = 'exception',
}

export enum EventType {
    Debug = 'debug',
    Access = 'access',
    Exit = 'exit',
    Interact = 'interact',
}

export enum ExceptionType {
    Error = 'Error',
}

export enum EventID {
    EntryAppLuckOpen = 'entry_app_luck_open',
    EntryAppLuckCreate = 'entry_app_luck_create',
    // todo
    EntryAppLuckSend = 'entry_app_luck_send',

    EntryAppNftpfpOpen = 'entry_app_nftpfp_open',
    EntryAppNftpfpSetting = 'entry_app_nftpfp_setting',
    EntryAppSwapOpen = 'entry_app_swap_open',
    EntryAppApprovalOpen = 'entry_app_approval_open',
    EntryAppCheckOpen = 'entry_app_check_open',
    // todo
    EntryTimelineDsearchToken = 'entry_timeline_dsearch_token',
    EntryTimelineDsearchNft = 'entry_timeline_dsearch_nft',
    EntryTimelineDsearchAddress = 'entry_timeline_dsearch_address',
    EntryTimelineDsearchEns = 'entry_timeline_dsearch_ens',
    EntryTimelineDsearchName = 'entry_timeline_dsearch_name',

    EntryTimelineTipsOpen = 'entry_timeline_tips_open',
    EntryTimelineTipsSend = 'entry_timeline_tips_send',
    EntryTimelineHoverTokenDuration = 'entry_timeline_hover_token_duration',
    EntryTimelineHoverNftDuration = 'entry_timeline_hover_nft_duration',
    EntryTimelineHoverUserNftClickNft = 'entry_timeline_hover_user_nft_click_nft',
    EntryTimelineHoverUserNftSwitchChain = 'entry_timeline_hover_user_nft_switch_chain',
    EntryTimelineHoverUserActivitiesSwitchTo = 'entry_timeline_hover_user_activities_switch_to',
    EntryTimelineHoverUserDonationsSwitchTo = 'entry_timeline_hover_user_donations_switch_to',
    EntryTimelineHoverUserSocialSwitchTo = 'entry_timeline_hover_user_social_switch_to',

    EntryPopupSoaccountConnectTwitter = 'entry_popup_soaccount_connect_twitter',
    EntryPopupSoaccountConnectFb = 'entry_popup_soaccount_connect_fb',
    EntryPopupSoaccountConnectMinds = 'entry_popup_soaccount_connect_minds',
    EntryPopupSoaccountConnectIns = 'entry_popup_soaccount_connect_ins',
    EntryPopupSoaccountVerifyTwitter = 'entry_popup_soaccount_verify_twitter',
    EntryPopupSoaccountDisconnectTwitter = 'entry_popup_soaccount_disconnect_twitter',
    EntryPopupSoaccountDisconnectFb = 'entry_popup_soaccount_disconnect_fb',
    EntryPopupSoaccountDisconnectMinds = 'entry_popup_soaccount_disconnect_minds',
    EntryPopupSoaccountDisconnectIns = 'entry_popup_soaccount_disconnect_ins',
    EntryPopupWalletCreate = 'entry_popup_wallet_create',
    EntryPopupWalletImport = 'entry_popup_wallet_import',
    EntryProfileTokenSwitchTrend = 'entry_profile_token_switch_trend',
    EntryProfileTokenSwitchMarket = 'entry_profile_token_switch_market',
    EntryProfileNftItemsSwitchTo = 'entry_profile_nft_items_switch_to',
    EntryProfileNftTrendSwitchTo = 'entry_profile_nft_trend_switch_to',
    EntryProfileNftActivitiesSwitchTo = 'entry_profile_nft_activities_switch_to',
    EntrySwitchLogoSave = 'entry_switch_logo_save',
    EntryMaskComposeOpen = 'entry_mask_compose_open',
    EntryMaskComposeVisibleAll = 'entry_mask_compose_visible_all',
    EntryMaskComposeVisiblePrivate = 'entry_mask_compose_visible_private',
    EntryMaskComposeVisibleSelected = 'entry_mask_compose_visible_selected',
    EntryMaskComposeEncrypt = 'entry_mask_compose_encrypt',

    // Open the Web3 tabs but no persona detected
    AccessWeb3TabCreatePersonaTab = 'AccessWeb3TabCreatePersonaTab',
    // Open the Web3 tabs the NFTs tab presents
    AccessWeb3TabNFTsTab = 'AccessWeb3TabNFTsTab',
    // Open the Web3 tabs the Activities tab presents
    AccessWeb3TabActivitiesTab = 'AccessWeb3TabActivitiesTab',
    // Open the Web3 tabs the Donation tab presents
    AccessWeb3TabDonationTab = 'AccessWeb3TabDonationTab',
    // Open the Web3 tabs the Social tab presents
    AccessWeb3TabSocialTab = 'AccessWeb3TabSocialTab',
    // Open the web3 profile dialog
    AccessWeb3ProfileDialog = 'AccessWeb3ProfileDialog',
    // Open the Web3 profile dialog the NFTs tab presents
    AccessWeb3ProfileDialogNFTsTab = 'AccessWeb3ProfileDialogNFTsTab',
    // Open the Web3 profile dialog the Activities tab presents
    AccessWeb3ProfileDialogActivitiesTab = 'AccessWeb3ProfileDialogActivitiesTab',
    // Open the Web3 profile dialog the Donation tab presents
    AccessWeb3ProfileDialogDonationTab = 'AccessWeb3ProfileDialogDonationTab',
    // Open the Web3 profile dialog the Social tab presents
    AccessWeb3ProfileDialogSocialTab = 'AccessWeb3ProfileDialogSocialTab',
    // Open the trader plugin
    AccessTradePlugin = 'AccessTradePlugin',
    // Send the trader transaction successfully
    SendTraderTransactionSuccessfully = 'SendTraderTransactionSuccessfully',
    // The toolbar has successfully injected
    AccessToolbox = 'AccessToolbox',
    // Open the application board dialog
    AccessApplicationBoard = 'AccessApplicationBoard',
    // Open the SPA
    AccessApp = 'AccessApp',
    // Open the dashboard page
    AccessDashboard = 'AccessDashboard',
    // Open the popups page
    AccessPopups = 'AccessPopups',
    // For debug only
    Debug = 'Debug',
}

export enum ExceptionID {
    FetchError = 'FetchError',
    Debug = 'DebugError',
}

export interface NetworkOptions {
    chainId?: number
    pluginID?: PluginID
    networkID?: NetworkPluginID
    networkType?: string
    providerType?: string
}

export interface UserOptions {
    userID?: string
    account?: string
}

export interface DeviceOptions {}

export interface CommonOptions {
    user?: UserOptions
    device?: DeviceOptions
    network?: NetworkOptions
    // default to 1 (100%)
    sampleRate?: number
}

export interface EventOptions extends CommonOptions {
    eventType: EventType
    eventID: EventID
    message?: string
}

export interface ExceptionOptions extends CommonOptions {
    exceptionType: ExceptionType
    exceptionID: ExceptionID
    error: Error
}

export interface Provider {
    user?: UserOptions
    device?: DeviceOptions
    network?: NetworkOptions

    enable(): void
    disable(): void

    captureEvent(options: EventOptions): void
    captureException(options: ExceptionOptions): void
}
