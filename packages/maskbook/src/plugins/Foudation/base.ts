import type { Plugin } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: 'io.mask.foudation',
    icon: '🤔',
    name: { fallback: 'Foudation' },
    description: { fallback: 'Foudation plugin to Mask for buy nft' },
    publisher: { name: { fallback: 'Lucas Espinosa' }, link: 'https://github.com/lucasespinosa28/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
