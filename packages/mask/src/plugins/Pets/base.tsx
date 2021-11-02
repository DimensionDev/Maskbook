import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'
import { PetsPluginID } from './constants'
import { PETSIcon } from '../../resources/PETSIcon'

export const base: Plugin.Shared.Definition = {
    ID: PetsPluginID,
    icon: <PETSIcon />,
    name: { fallback: 'NFT revolution' },
    description: {
        fallback:
            'Explore the endless possibilities of NFTs. Link and display your NFTs on social media in a revolutionized way.',
    },
    publisher: { name: { fallback: '' }, link: 'https://github.com/etouyang/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-in', networks: { [CurrentSNSNetwork.Twitter]: true } },
        target: 'stable',
    },
}
