import type { Plugin } from '@masknet/plugin-infra'
import { PluginId } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: PluginId.IdeaMarket,
    name: { fallback: 'IdeaMarket' },
    description: {
        fallback: "Ideamarket values the world's information,creating public narratives without third parties.",
    },
    publisher: { name: { fallback: 'IdeaMarket' }, link: 'https://ideamarket.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'beta',
    },
    experimentalMark: true,
    contribution: {
        postContent: new Set([/(https:\/\/)?ideamarket.io\/?/]),
    },
}
