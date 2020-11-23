import { ChainId } from '../types'

export const MIN_AMOUNT_LENGTH = 1
export const MAX_AMOUNT_LENGTH = 79

export const CONSTANTS = {
    // token lists
    ERC20_TOKEN_LISTS: {
        [ChainId.Mainnet]: [
            'http://tokens.1inch.eth.link/',
            'http://defi.cmc.eth.link/',
            'https://www.coingecko.com/tokens_list/uniswap/defi_100/v_0_0_0.json',
            'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
            'http://tokenlist.dharma.eth.link',
            'https://raw.githubusercontent.com/DimensionDev/Maskbook-Token-List/gh-pages/maskbook_v_0_0_1.json',
        ],
        [ChainId.Ropsten]: [] as string[],
        [ChainId.Rinkeby]: [
            'https://raw.githubusercontent.com/DimensionDev/Maskbook-Token-List/gh-pages/maskbook_v_0_0_1.json',
        ],
        [ChainId.Kovan]: [] as string[],
    },

    // contracts
    BALANCE_CHECKER_ADDRESS: {
        [ChainId.Mainnet]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
        [ChainId.Ropsten]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
        [ChainId.Rinkeby]: '0xe3AE8Ae4160680C7Ac0FB0A79F519d7D7eAe06aB',
        [ChainId.Kovan]: '',
    },
    MULTICALL_ADDRESS: {
        [ChainId.Mainnet]: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
        [ChainId.Kovan]: '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a',
    },

    // tokens
    WETH_ADDRESS: {
        [ChainId.Mainnet]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        [ChainId.Ropsten]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        [ChainId.Rinkeby]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        [ChainId.Kovan]: '',
    },
    USDC_ADDRESS: {
        [ChainId.Mainnet]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
    },
    USDT_ADDRESS: {
        [ChainId.Mainnet]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0xf88Bf61674BA3eD8B55a15f820CA8C2228953d08',
        [ChainId.Kovan]: '',
    },
    COMP_ADDRESS: {
        [ChainId.Mainnet]: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
    },
    MKR_ADDRESS: {
        [ChainId.Mainnet]: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
    },
    MSKA_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0x960B816d6dD03eD514c03F56788279154348Ea37',
        [ChainId.Kovan]: '',
    },
    MSKB_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0xFa4Bddbc85c0aC7a543c4b59dCfb5deB17F67D8E',
        [ChainId.Kovan]: '',
    },
    MSKC_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '0xbE88c0E7029929f50c81690275395Da1d05745B0',
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
    ETH_ADDRESS: {
        [ChainId.Mainnet]: '0x0000000000000000000000000000000000000000',
        [ChainId.Ropsten]: '0x0000000000000000000000000000000000000000',
        [ChainId.Rinkeby]: '0x0000000000000000000000000000000000000000',
        [ChainId.Kovan]: '0x0000000000000000000000000000000000000000',
    },

    // settings
    INFURA_ADDRESS:
        process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
            ? {
                  [ChainId.Mainnet]: 'https://mainnet.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195',
                  [ChainId.Ropsten]: 'https://ropsten.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195',
                  [ChainId.Rinkeby]: 'https://rinkeby.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195',
                  [ChainId.Kovan]: 'https://kovan.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195',
              }
            : {
                  [ChainId.Mainnet]:
                      'https://throbbing-blue-bird.quiknode.io/73e66978-1a45-4f91-97f3-25d59b51a00e/YScEAjYfzZqNphokjzn-Zt3sZsOd0Nav5sauA3j03se0LOseR8PQFyBfINzhYStWrg44VfLLfCFE34FR2CA_kQ==/',
                  [ChainId.Ropsten]: 'https://ropsten.infura.io/v3/11f8b6b36f4a408e85d8a4e52d31edc5',
                  [ChainId.Rinkeby]: 'https://rinkeby.infura.io/v3/11f8b6b36f4a408e85d8a4e52d31edc5',
                  [ChainId.Kovan]: 'https://kovan.infura.io/v3/11f8b6b36f4a408e85d8a4e52d31edc5',
              },
}
