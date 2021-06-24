import { ChainId } from '@masknet/web3-shared'

export const DHEDGE_PLUGIN_ID = 'co.dhedge'
export const POOL_DESCRIPTION_LIMIT = 210
export const BLOCKIES_OPTIONS = {
    color: '#cb7a89',
    bgcolor: '#91f5a9',
    size: 7,
    scale: 16,
}

export const CONSTANT = {
    URL: {
        [ChainId.Mainnet]: 'https://app.dhedge.org',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: 'https://dh-1111.web.app',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    API_URL: {
        [ChainId.Mainnet]: 'https://api.dhedge.org/graphql',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: 'https://dev.dhedge.org/graphql',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
}
