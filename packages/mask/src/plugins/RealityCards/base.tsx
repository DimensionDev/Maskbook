import type { Plugin } from '@masknet/plugin-infra'
import { RealityCardsIcon } from '../../resources/RealityCardsIcon'
import { REALITYCARDS_PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: REALITYCARDS_PLUGIN_ID,
    icon: <RealityCardsIcon />,
    name: { fallback: 'RealityCards' },
    description: {
        fallback:
            'Reality Cards turns real-world markets into collectable NFTs by combining prediction market elements with an NFT marketplace.',
    },
    publisher: { name: { fallback: 'iRhonin' }, link: 'https://github.com/iRhonin' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
