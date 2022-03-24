import type { Plugin } from '@masknet/plugin-infra'
import { IDEAMARKET_PLUGIN_ID } from './constants'
import { IdeaMarketIcon } from './icons/IdeaMarketIcon'

export const base: Plugin.Shared.Definition = {
    ID: IDEAMARKET_PLUGIN_ID,
    icon: <IdeaMarketIcon />,
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
    contribution: {
        postContent: new Set([/(https:\/\/)?ideamarket.io\/?/]),
    },
}
