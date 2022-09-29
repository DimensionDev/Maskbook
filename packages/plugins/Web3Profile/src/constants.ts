import { PluginID } from '@masknet/shared-base'

export const PLUGIN_ID = PluginID.Web3Profile
export const PLUGIN_DESCRIPTION = 'Choose and showcase your Web3 footprints on Twitter.'
export const PLUGIN_NAME = 'Web3 Profile'

export enum Scene {
    Main = 1,
    NFTSetting = 2,
    DonationsSetting = 3,
    FootprintsSetting = 4,
}

export const SceneMap = {
    [Scene.Main]: {
        title: 'Web3 Profile',
    },
    [Scene.NFTSetting]: {
        title: 'NFTs',
    },
    [Scene.DonationsSetting]: {
        title: 'Donations',
    },
    [Scene.FootprintsSetting]: {
        title: 'Footprints',
    },
}
