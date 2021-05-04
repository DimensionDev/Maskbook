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
    GITCOIN_MAINTAINER_ADDRESS: {
        [ChainId.Mainnet]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [ChainId.Ropsten]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [ChainId.Rinkeby]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    BULK_CHECKOUT_ADDRESS: {
        [ChainId.Mainnet]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [ChainId.Ropsten]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [ChainId.Rinkeby]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    GITCOIN_ETH_ADDRESS: {
        [ChainId.Mainnet]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Ropsten]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Rinkeby]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
    GITCOIN_TIP_PERCENTAGE: {
        [ChainId.Mainnet]: 5,
        [ChainId.Ropsten]: 5,
        [ChainId.Rinkeby]: 5,
        [ChainId.Kovan]: 5,
        [ChainId.Gorli]: 5,
    },
}
