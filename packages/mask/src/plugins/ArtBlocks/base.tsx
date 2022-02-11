import type { Plugin } from '@masknet/plugin-infra'
import ArtBlocksIcon from './SNSAdaptor/ArtBlocksIcon'

export const base: Plugin.Shared.Definition = {
    ID: 'artblocks.io',
    icon: <ArtBlocksIcon />,
    name: { fallback: 'ArtBlocks' },
    description: {
        fallback:
            'Artblocks allow you to pick a style that you like, pay for the work, and a randomly generated version of the content is created by an algorithm and sent to your Ethereum account.',
    },
    publisher: { name: { fallback: 'SebastianLF' }, link: 'https://github.com/sebastianLF' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
