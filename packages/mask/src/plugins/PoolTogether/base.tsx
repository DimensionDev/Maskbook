import type { Plugin } from '@masknet/plugin-infra'
import { POOLTOGETHER_PLUGIN_ID, URL_PATTERN } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: POOLTOGETHER_PLUGIN_ID,
    name: { fallback: 'Pooltogether' },
    description: { fallback: 'PoolTogether is a protocol for no-loss prize games on the Ethereum blockchain' },
    publisher: { name: { fallback: 'iRhonin' }, link: 'https://github.com/iRhonin' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'insider',
    },
    contribution: { postContent: new Set([URL_PATTERN]) },
}
