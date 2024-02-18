import { EnhanceableSite } from '@masknet/shared-base'
import { EventID } from '@masknet/web3-telemetry/types'

export const EventMap: Record<EnhanceableSite, EventID> = {
    [EnhanceableSite.Twitter]: EventID.EntryPopupSocialAccountConnectTwitter,
    [EnhanceableSite.Facebook]: EventID.EntryPopupSocialAccountConnectFb,
    [EnhanceableSite.Minds]: EventID.EntryPopupSocialAccountConnectMinds,
    [EnhanceableSite.Instagram]: EventID.EntryPopupSocialAccountConnectIns,
    [EnhanceableSite.Localhost]: EventID.Debug,
    [EnhanceableSite.OpenSea]: EventID.Debug,
    [EnhanceableSite.Mirror]: EventID.Debug,
    [EnhanceableSite.Firefly]: EventID.Debug,
}

export const DisconnectEventMap: Record<string, EventID> = {
    [EnhanceableSite.Twitter]: EventID.EntryPopupSocialAccountDisconnectTwitter,
    [EnhanceableSite.Facebook]: EventID.EntryPopupSocialAccountDisconnectFb,
    [EnhanceableSite.Minds]: EventID.EntryPopupSocialAccountDisconnectMinds,
    [EnhanceableSite.Instagram]: EventID.EntryPopupSocialAccountDisconnectIns,
}
