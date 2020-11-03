import { ChainId } from '../../web3/types'

export const GITCOIN_CONSTANT = {
    // accounts
    GITCOIN_MAINTAINER_ADDRESS: {
        [ChainId.Mainnet]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [ChainId.Ropsten]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [ChainId.Rinkeby]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [ChainId.Kovan]: '',
    },

    // contracts
    BULK_CHECKOUT_ADDRESS: {
        [ChainId.Mainnet]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [ChainId.Ropsten]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [ChainId.Rinkeby]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [ChainId.Kovan]: '',
    },

    // tokens
    GITCOIN_ETH_ADDRESS: {
        [ChainId.Mainnet]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Ropsten]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Rinkeby]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Kovan]: '',
    },

    // settings
    GITCOIN_TIP_PERCENTAGE: {
        [ChainId.Mainnet]: 5,
        [ChainId.Ropsten]: 5,
        [ChainId.Rinkeby]: 5,
        [ChainId.Kovan]: 5,
    },
}
