import { Plugin, PluginId } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: PluginId.NFTAvatar,
    name: { fallback: 'NFT Avatars' },
    description: {
        fallback: 'NFT Avatars',
    },
    publisher: { name: { fallback: 'mask network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
