import { EnhanceableSite } from '@masknet/shared-base'
import { EventID } from '@masknet/web3-telemetry/types'

export const EventMap: Record<EnhanceableSite, EventID> = {
    [EnhanceableSite.Twitter]: EventID.EntryPopupSoaccountConnectTwitter,
    [EnhanceableSite.Facebook]: EventID.EntryPopupSoaccountConnectFb,
    [EnhanceableSite.Minds]: EventID.EntryPopupSoaccountConnectMinds,
    [EnhanceableSite.Instagram]: EventID.EntryPopupSoaccountConnectIns,
    [EnhanceableSite.Localhost]: EventID.Debug,
    [EnhanceableSite.App]: EventID.Debug,
    [EnhanceableSite.OpenSea]: EventID.Debug,
    [EnhanceableSite.Mirror]: EventID.Debug,
}

export const DisconnectEventMap: Record<string, EventID> = {
    [EnhanceableSite.Twitter]: EventID.EntryPopupSoaccountDisconnectTwitter,
    [EnhanceableSite.Facebook]: EventID.EntryPopupSoaccountDisconnectFb,
    [EnhanceableSite.Minds]: EventID.EntryPopupSoaccountDisconnectMinds,
    [EnhanceableSite.Instagram]: EventID.EntryPopupSoaccountDisconnectIns,
}
