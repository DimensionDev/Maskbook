import type { Plugin } from '@masknet/plugin-infra'
import ArtBlocksIcon from './SNSAdaptor/ArtBlocksIcon'

export const base: Plugin.Shared.Definition = {
    ID: 'artblocks',
    icon: <ArtBlocksIcon />,
    name: { fallback: 'ArtBlocks Plugin' },
    description: {
        fallback:
            'Art Blocks is a first of its kind platform focused on genuinely programmable on demand generative content that is stored immutably on the Ethereum Blockchain. You pick a style that you like, pay for the work, and a randomly generated version of the content is created by an algorithm and sent to your Ethereum account. ',
    },
    publisher: { name: { fallback: 'SebastianLF' }, link: 'https://github.com/sebastianLF' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
