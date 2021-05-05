import { ChainId } from '../../web3/types'

export const DHEDGE_PLUGIN_ID = 'co.dhedge'

export const DHEDGE_CONSTANT = {
    DHEDGE_URL: {
        [ChainId.Mainnet]: 'https://app.dhedge.org',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: 'https://dh-1111.web.app',
        [ChainId.Gorli]: '',
    },
    DHEDGE_API_URL: {
        [ChainId.Mainnet]: 'https://api.dhedge.org/graphql',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: 'https://dev.dhedge.org/graphql',
        [ChainId.Gorli]: '',
    },
    DHEDGE_TOKEN_ADDRESSES: {
        [ChainId.Mainnet]: [
            '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51', // sUSD
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
            '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
            '0xe2f2a5c287993345a840db3b0845fbc70f5935a5', // mSUD
        ],
        [ChainId.Ropsten]: [],
        [ChainId.Rinkeby]: [],
        [ChainId.Kovan]: [
            '0x57ab1ec28d129707052df4df418d58a2d46d5f51', // sUSD
        ],
        [ChainId.Gorli]: [],
    },
}
