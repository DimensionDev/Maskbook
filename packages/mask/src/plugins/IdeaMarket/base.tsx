import type { Plugin } from '@masknet/plugin-infra'
import { createMatchLink } from './constants'
import IdeaMarketIcon from './icons/IdeaMarketIcon'

export const base: Plugin.Shared.Definition = {
    ID: 'io.ideamarket',
    icon: <IdeaMarketIcon />,
    name: { fallback: 'IdeaMarket' },
    description: { fallback: 'Ideamarket is a dapp for creating public narratives without trusted third parties.' },
    publisher: { name: { fallback: 'sebastianLF' }, link: 'https://github.com/sebastianLF' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'beta',
    },
    contribution: {
        postContent: new Set([createMatchLink()]),
    },
}
