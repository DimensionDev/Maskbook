import { ChainId } from '../../web3/types'

export const DHEDGE_PLUGIN_ID = 'co.dhedge'
export const POOL_DESCRIPTION_LIMIT = 180
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
    },
    API_URL: {
        [ChainId.Mainnet]: 'https://api.dhedge.org/graphql',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: 'https://dev.dhedge.org/graphql',
        [ChainId.Gorli]: '',
    },

    ALLOWED_TOKEN_ADDRESSES: {
        [ChainId.Mainnet]: [
            '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51', // sUSD
        ],
        [ChainId.Ropsten]: [
            '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51', // sUSD
        ],
        [ChainId.Rinkeby]: [
            '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51', // sUSD
        ],
        [ChainId.Kovan]: [
            '0x57ab1ec28d129707052df4df418d58a2d46d5f51', // sUSD
        ],
        [ChainId.Gorli]: [
            '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51', // sUSD
        ],
    },
}
