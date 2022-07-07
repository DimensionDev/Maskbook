import { PluginId } from '@masknet/plugin-infra'

export const PLUGIN_ID = PluginId.Web3Profile
export const PLUGIN_DESCRIPTION = 'Choose and showcase your Web3 footprints on Twitter.'
export const PLUGIN_NAME = 'Web3 Profile'
export enum CURRENT_STATUS {
    Main = 1,
    NFT_Setting = 2,
    Donations_setting = 3,
    Footprints_setting = 4,
}

export const CurrentStatusMap = {
    [CURRENT_STATUS.Main]: {
        title: 'Web3 Profile',
    },
    [CURRENT_STATUS.NFT_Setting]: {
        title: 'NFTs',
    },
    [CURRENT_STATUS.Donations_setting]: {
        title: 'Donations',
    },
    [CURRENT_STATUS.Footprints_setting]: {
        title: 'Footprints',
    },
}
