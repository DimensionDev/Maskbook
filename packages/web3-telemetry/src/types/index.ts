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
    EntryAppLuckSend = 'entry_app_luck_send',
    EntryAppNFT_PFP_Open = 'entry_app_nft_pfp_open',
    EntryAppNFT_PFP_Setting = 'entry_app_nft_pfp_setting',
    EntryAppSwapOpen = 'entry_app_swap_open',
    EntryAppApprovalOpen = 'entry_app_approval_open',
    EntryAppCheckOpen = 'entry_app_check_open',
    EntryAppFileOpen = 'entry_app_file_open',
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
    EntryPopupSocialAccountConnectTwitter = 'entry_popup_social_account_connect_twitter',
    EntryPopupSocialAccountConnectFb = 'entry_popup_social_account_connect_fb',
    EntryPopupSocialAccountConnectMinds = 'entry_popup_social_account_connect_minds',
    EntryPopupSocialAccountConnectIns = 'entry_popup_social_account_connect_ins',
    EntryPopupSocialAccountVerifyTwitter = 'entry_popup_social_account_verify_twitter',
    EntryPopupSocialAccountDisconnectTwitter = 'entry_popup_social_account_disconnect_twitter',
    EntryPopupSocialAccountDisconnectFb = 'entry_popup_social_account_disconnect_fb',
    EntryPopupSocialAccountDisconnectMinds = 'entry_popup_social_account_disconnect_minds',
    EntryPopupSocialAccountDisconnectIns = 'entry_popup_social_account_disconnect_ins',
    EntryPopupWalletCreate = 'entry_popup_wallet_create',
    EntryPopupWalletImport = 'entry_popup_wallet_import',
    EntryProfileTokenSwitchTrend = 'entry_profile_token_switch_trend',
    EntryProfileTokenSwitchMarket = 'entry_profile_token_switch_market',
    EntryProfileNFT_ItemsSwitchTo = 'entry_profile_nft_items_switch_to',
    EntryProfileNFT_TrendSwitchTo = 'entry_profile_nft_trend_switch_to',
    EntryProfileNFT_ActivitiesSwitchTo = 'entry_profile_nft_activities_switch_to',
    EntrySwitchLogoSave = 'entry_switch_logo_save',
    EntryMaskComposeOpen = 'entry_mask_compose_open',
    EntryMaskComposeVisibleAll = 'entry_mask_compose_visible_all',
    EntryMaskComposeVisiblePrivate = 'entry_mask_compose_visible_private',
    EntryMaskComposeVisibleSelected = 'entry_mask_compose_visible_selected',
    EntryMaskComposeEncrypt = 'entry_mask_compose_encrypt',
    EntryProfileUserNftsClickNft = 'entry_profile_user_nfts_click_nft',
    EntryProfileUserNftsSwitchChain = 'entry_profile_user_nfts_switch_chain',
    EntryProfileUserActivitiesSwitchTo = 'entry_profile_user_activities_switch_to',
    EntryProfileUserDonationsSwitchTo = 'entry_profile_user_donations_switch_to',
    EntryProfileUserSocialSwitchTo = 'entry_profile_user_social_switch_to',
    EntryProfileConnectTwitter = 'entry_profile_connect_twitter',
    EntryProfileConnectVerify = 'entry_profile_connect_verify',
    EntryMaskComposeConnectTwitter = 'entry_mask_compose_connect_twitter',
    EntryMaskComposeVerifyTwitter = 'entry_mask_compose_verify_twitter',
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

export type DeviceOptions = Record<never, never>

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
