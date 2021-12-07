import type { Plugin } from '@masknet/plugin-infra'
import { FIND_TRUMAN_PLUGIN_ID, FIND_TRUMAN_PLUGIN_NAME } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: FIND_TRUMAN_PLUGIN_ID,
    icon: '👁',
    name: { fallback: FIND_TRUMAN_PLUGIN_NAME },
    description: {
        fallback: 'A plugin for https://findtruman.io/',
    },
    publisher: { name: { fallback: 'FindTruman' }, link: 'https://findtruman.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    contribution: {
        postContent: new Set([
            /https:\/\/findtruman.io\/#\/(findtruman\/stories\/[\dA-Za-z]+(\/|\/(puzzles|polls|puzzle_result|poll_result)\/[\dA-Za-z]+\/?)?|encryption\?payload=.+)/,
        ]),
    },
}
