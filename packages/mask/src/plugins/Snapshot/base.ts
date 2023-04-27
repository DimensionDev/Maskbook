import type { Plugin } from '@masknet/plugin-infra'
import { SNAPSHOT_PLUGIN_ID } from './constants.js'

export const base: Plugin.Shared.Definition = {
    ID: SNAPSHOT_PLUGIN_ID,
    name: { fallback: 'DAO' },
    description: {
        fallback: 'A plugin for https://snapshot.org/',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    contribution: {
        postContent: new Set([/https:\/\/(?:www.)?snapshot.(org|page)\/#\/(.*?)\/proposal\/[\dA-Za-z]+/]),
    },
}
