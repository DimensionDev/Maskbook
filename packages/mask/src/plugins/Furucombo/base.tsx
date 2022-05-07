import type { Plugin } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Furucombo' },
    description: {
        fallback: 'Furucombo is a tool built for end-users to optimize their DeFi strategy simply by drag and drop.',
    },
    publisher: { name: { fallback: 'SebastianLF' }, link: 'https://github.com/SebastianLF' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    contribution: {
        postContent: new Set([/https:\/\/furucombo.app\/invest\/(pool|farm)\/(137|1)\/(0x\w+)/]),
        metadataKeys: new Set([PLUGIN_ID]),
    },
}
