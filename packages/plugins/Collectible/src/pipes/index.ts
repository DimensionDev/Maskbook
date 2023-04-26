import { ChainId } from '@masknet/web3-shared-evm'
import { createLookupTableResolver } from '@masknet/shared-base'
import {
    RaribleRopstenUserURL,
    RaribleUserURL,
    RaribleRinkebyUserURL,
    OpenSeaMainnetURL,
    OpenSeaTestnetURL,
} from '../constants.js'

type RaribleSupportedChainId = ChainId.Mainnet | ChainId.Ropsten | ChainId.Rinkeby
type OpenSeaSupportedChainId = ChainId.Mainnet | ChainId.Rinkeby
type ZoraSupportedChainId = ChainId.Mainnet

export const resolveRaribleUserNetwork = createLookupTableResolver<RaribleSupportedChainId, string>(
    {
        [ChainId.Mainnet]: RaribleUserURL,
        [ChainId.Ropsten]: RaribleRopstenUserURL,
        [ChainId.Rinkeby]: RaribleRinkebyUserURL,
    },
    RaribleUserURL,
)

export const resolveLinkOnOpenSea = createLookupTableResolver<OpenSeaSupportedChainId, string>(
    {
        [ChainId.Mainnet]: OpenSeaMainnetURL,
        [ChainId.Rinkeby]: OpenSeaTestnetURL,
    },
    OpenSeaMainnetURL,
)

export const resolveLinkOnRarible = createLookupTableResolver<RaribleSupportedChainId, string>(
    {
        [ChainId.Mainnet]: 'https://rarible.com',
        [ChainId.Rinkeby]: 'https://rinkeby.rarible.com',
        [ChainId.Ropsten]: 'https://ropsten.rarible.com',
    },
    'https://rarible.com',
)

export const resolveLinkOnZora = createLookupTableResolver<ZoraSupportedChainId, string>(
    {
        [ChainId.Mainnet]: 'https://zora.co',
    },
    'https://zora.co',
)
