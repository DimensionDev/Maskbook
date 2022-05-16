import type { Plugin } from '@masknet/plugin-infra'
import { createMatchLink, DHEDGE_PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: DHEDGE_PLUGIN_ID,
    name: { fallback: 'dHEDGE' },
    description: { fallback: 'Decentralized hedge funds on Ethereum.' },
    publisher: { name: { fallback: 'iRhonin' }, link: 'https://github.com/iRhonin' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    contribution: {
        postContent: new Set([createMatchLink()]),
    },
}
