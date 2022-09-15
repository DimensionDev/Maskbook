import { PluginID } from '@masknet/plugin-infra'
import { EnhanceableSite } from '@masknet/shared-base'

export const PLUGIN_ID = PluginID.Web3ProfileCard
export const PLUGIN_NAME = 'Web3ProfileCard'
export const PLUGIN_DESCRIPTION = 'Web3 Profile Card on social account avatar.'

export enum RSS3_KEY_SNS {
    TWITTER = '_nfts',
    FACEBOOK = '_facebook_nfts',
    INSTAGRAM = '_instagram_nfts',
}

export const SNS_RSS3_FIELD_KEY_MAP: Partial<Record<EnhanceableSite, RSS3_KEY_SNS>> = {
    [EnhanceableSite.Facebook]: RSS3_KEY_SNS.FACEBOOK,
    [EnhanceableSite.Twitter]: RSS3_KEY_SNS.TWITTER,
    [EnhanceableSite.Instagram]: RSS3_KEY_SNS.INSTAGRAM,
}
