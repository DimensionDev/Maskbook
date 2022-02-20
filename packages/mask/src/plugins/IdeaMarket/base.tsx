import type { Plugin } from '@masknet/plugin-infra'
import { IdeaMarketIcon } from './icons/IdeaMarketIcon'

export const base: Plugin.Shared.Definition = {
    ID: 'io.ideamarket',
    icon: <IdeaMarketIcon />,
    name: { fallback: 'IdeaMarket' },
    description: {
        fallback: "Ideamarket values the world's information,creating public narratives without third parties.",
    },
    publisher: { name: { fallback: 'sebastianLF' }, link: 'https://github.com/sebastianLF' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'beta',
    },
    contribution: {
        postContent: new Set([/(https:\/\/)?ideamarket.io\/?/]),
    },
}
