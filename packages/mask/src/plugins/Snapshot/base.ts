import type { Plugin } from '@masknet/plugin-infra'
import { SNAPSHOT_PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: SNAPSHOT_PLUGIN_ID,
    icon: '\u{1F4F7}',
    name: { fallback: 'Snapshot' },
    description: {
        fallback: 'A plugin for https://snapshot.org/',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    contribution: {
        postContent: new Set([/https:\/\/(?:www.)?snapshot.(org|page)\/#\/(.*?)\/proposal\/[\dA-Za-z]+/]),
    },
}
