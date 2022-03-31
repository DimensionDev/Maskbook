import { Plugin, PluginId } from '@masknet/plugin-infra'
import { NFTAvatarsIcon } from '../../resources/nftavatars'

export const base: Plugin.Shared.Definition = {
    ID: PluginId.NFTAvatar,
    icon: <NFTAvatarsIcon />,
    name: { fallback: 'NFT Avatars' },
    description: {
        fallback: 'NFT Avatars',
    },
    publisher: { name: { fallback: 'mask network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-in', networks: {} },
        target: 'stable',
    },
}
