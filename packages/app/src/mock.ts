/* cspell:disable */
import type { ProfileIdentifier } from '@masknet/base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { NetworkPluginID, SocialAddressType, type SocialAccount } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export const currentVisitingSocialIdentity: IdentityResolved = {
    identifier: {
        network: 'twitter.com',
        userId: 'suji_yan',
    } as ProfileIdentifier,
    nickname: 'Suji Yan - Mask is BUIDLing',
    avatar: 'https://pbs.twimg.com/profile_images/1571030729605144577/Nxsva4Vq_400x400.png',
    bio: 'founder of @realmasknetwork #Mask\u{1F426}\nMaintain some fediverse instances\nsujiyan.eth',
    homepage: 'https://mask.io',
    isOwner: false,
}
export const socialAccounts: Array<SocialAccount<Web3Helper.ChainIdAll>> = [
    {
        pluginID: NetworkPluginID.PLUGIN_EVM,
        address: '0x934B510D4C9103E6a87AEf13b816fb080286D649',
        label: 'sujiyan.eth',
        supportedAddressTypes: [SocialAddressType.ENS, SocialAddressType.TwitterBlue, SocialAddressType.OpenSea],
    },
    {
        pluginID: NetworkPluginID.PLUGIN_EVM,
        address: '0x7cbba07e31dc7b12bb69a1209c5b11a8ac50acf5',
        label: '',
        supportedAddressTypes: [SocialAddressType.Firefly],
    },
]

export const currentSocialIdentity = {
    identifier: {
        network: 'twitter.com',
        userId: 'suji_yan',
    } as ProfileIdentifier,
    nickname: 'Suji Yan - Mask is BUIDLing',
    avatar: 'https://pbs.twimg.com/profile_images/1571030729605144577/Nxsva4Vq_400x400.png',
    bio: 'founder of @realmasknetwork #Mask\u{1F426}\nMaintain some fediverse instances\nsujiyan.eth',
    homepage: 'https://mask.io',
    isOwner: false,
    hasBinding: false,
}
