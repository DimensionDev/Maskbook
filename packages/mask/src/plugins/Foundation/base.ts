import type { Plugin } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: 'io.mask.foundation',
    icon: '\u{1F5BC}\uFE0F',
    name: { fallback: 'Foundation' },
    description: { fallback: 'Foundation plugin to Mask for buy nft' },
    publisher: { name: { fallback: 'Lucasespinosa28' }, link: 'https://github.com/lucasespinosa28/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
