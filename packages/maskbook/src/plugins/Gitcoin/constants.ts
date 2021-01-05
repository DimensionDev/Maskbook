import { ChainId } from '../../web3/types'

export const GITCOIN_PLUGIN_ID = 'co.gitcoin'

export const GITCOIN_CONSTANT = {
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

// proxy for: https://gitcoin.co/grants/v1/api/grant/
export const GITCOIN_API_GRANTS_V1 = 'https://gitcoin.provide.maskbook.com/grants/v1/api/grant/'
