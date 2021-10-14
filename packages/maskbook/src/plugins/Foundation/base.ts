import type { Plugin } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: 'io.mask.foundation',
    icon: '🤔',
    name: { fallback: 'Foundation' },
    description: { fallback: 'Foundation plugin to Mask for buy nft' },
    publisher: { name: { fallback: 'Lucas Espinosa' }, link: 'https://github.com/lucasespinosa28/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
