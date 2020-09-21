import { ChainId } from './types'

export const CONSTANTS = {
    // accounts
    GOTCOIN_MAINTAINER_ADDRESS: {
        [ChainId.Mainnet]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [ChainId.Ropsten]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [ChainId.Rinkeby]: '0x00De4B13153673BCAE2616b67bf822500d325Fc3',
        [ChainId.Kovan]: '',
    },

    // token lists
    TOKEN_LISTS: {
        [ChainId.Mainnet]: [
            'http://tokens.1inch.eth.link/',
            'http://defi.cmc.eth.link/',
            'https://www.coingecko.com/tokens_list/uniswap/defi_100/v_0_0_0.json',
            'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
            'http://tokenlist.dharma.eth.link',
        ],
        [ChainId.Ropsten]: [],
        [ChainId.Rinkeby]: [],
        [ChainId.Kovan]: [],
    },

    // contracts
    SPLITTER_ADDRESS: {
        [ChainId.Mainnet]: '0xdf869FAD6dB91f437B59F1EdEFab319493D4C4cE',
        [ChainId.Ropsten]: '0xdf869FAD6dB91f437B59F1EdEFab319493D4C4cE',
        [ChainId.Rinkeby]: '0xe93b4fF96201B68078E9fdDB8314BF732E9FFF91',
        [ChainId.Kovan]: '',
    },
    BULK_CHECKOUT_ADDRESS: {
        [ChainId.Mainnet]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [ChainId.Ropsten]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [ChainId.Rinkeby]: '0x7d655c57f71464B6f83811C55D84009Cd9f5221C',
        [ChainId.Kovan]: '',
    },
    HAPPY_RED_PACKET_ADDRESS: {
        [ChainId.Mainnet]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [ChainId.Ropsten]: '0x26760783c12181efa3c435aee4ae686c53bdddbb',
        [ChainId.Rinkeby]: '0x575f906db24154977c7361c2319e2b25e897e3b6',
        [ChainId.Kovan]: '',
    },
    BALANCE_CHECKER_ADDRESS: {
        [ChainId.Mainnet]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
        [ChainId.Ropsten]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
        [ChainId.Rinkeby]: '0xe3AE8Ae4160680C7Ac0FB0A79F519d7D7eAe06aB',
        [ChainId.Kovan]: '',
    },
    ROUTER_V2_ADDRESS: {
        [ChainId.Mainnet]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Ropsten]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Rinkeby]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Kovan]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    },

    // tokens
    WETH_ADDRESS: {
        [ChainId.Mainnet]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        [ChainId.Ropsten]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        [ChainId.Rinkeby]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        [ChainId.Kovan]: '',
    },
    DAI_ADDRESS: {
        [ChainId.Mainnet]: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
    },
    AMPL_ADDRESS: {
        [ChainId.Mainnet]: '0xD46bA6D942050d489DBd938a2C909A5d5039A161',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
    },
    OBK_ADDRESS: {
        [ChainId.Mainnet]: '0x75231f58b43240c9718dd58b4967c5114342a86c',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
    },
    USDK_ADDRESS: {
        [ChainId.Mainnet]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0xf88Bf61674BA3eD8B55a15f820CA8C2228953d08',
        [ChainId.Kovan]: '',
    },
    ETH_ADDRESS: {
        [ChainId.Mainnet]: '0x0000000000000000000000000000000000000000',
        [ChainId.Ropsten]: '0x0000000000000000000000000000000000000000',
        [ChainId.Rinkeby]: '0x0000000000000000000000000000000000000000',
        [ChainId.Kovan]: '0x0000000000000000000000000000000000000000',
    },
    GITCOIN_ETH_ADDRESS: {
        [ChainId.Mainnet]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Ropsten]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Rinkeby]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Kovan]: '',
    },

    // settings
    INFURA_ADDRESS: {
        [ChainId.Mainnet]: 'https://mainnet.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195',
        [ChainId.Ropsten]: 'https://ropsten.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195',
        [ChainId.Rinkeby]: 'https://rinkeby.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195',
        [ChainId.Kovan]: 'https://kovan.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195',
    },
}

export function getConstant<C extends typeof CONSTANTS, T extends keyof typeof CONSTANTS>(
    key: T,
    chainId = ChainId.Mainnet,
): C[T][ChainId.Mainnet] {
    if (chainId === ChainId.Rinkeby) return CONSTANTS[key][ChainId.Rinkeby]
    return CONSTANTS[key][ChainId.Mainnet]
}

export function getAllConstants<C extends typeof CONSTANTS, T extends keyof typeof CONSTANTS>(chainId: ChainId) {
    return Object.entries(CONSTANTS).reduce(
        (accumulate, [key, value]) => {
            accumulate[key as T] = value[chainId]
            return accumulate
        },
        {} as {
            [K in T]: C[K][ChainId.Mainnet]
        },
    )
}
