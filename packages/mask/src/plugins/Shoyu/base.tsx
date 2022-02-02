import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: 'io.mask.shoyu',
    icon: '',
    name: { fallback: 'Shoyu' },
    description: {
        fallback: 'The cultural standard for creative commerce',
    },
    publisher: { name: { fallback: 'codingsh' }, link: 'https://codinsh.dev' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-in', networks: { [CurrentSNSNetwork.Twitter]: true } },
        target: 'stable',
    },
}
