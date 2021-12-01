import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'
import { PetsPluginID } from './constants'
import { PETSIcon } from '../../resources/PETSIcon'

export const base: Plugin.Shared.Definition = {
    ID: PetsPluginID,
    icon: <PETSIcon />,
    name: { fallback: 'Non-Fungible Friends by Mint Team' },
    description: {
        fallback: 'Explore the endless possibilities of NFTs.',
    },
    publisher: { name: { fallback: '' }, link: 'https://github.com/etouyang/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-in', networks: { [CurrentSNSNetwork.Twitter]: true } },
        target: 'stable',
    },
}
