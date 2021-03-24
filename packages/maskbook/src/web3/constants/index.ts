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
            'https://dimensiondev.github.io/Mask-Token-List/mask.json',
        ],
        [ChainId.Ropsten]: ['https://dimensiondev.github.io/Mask-Token-List/mask.json'],
        [ChainId.Rinkeby]: ['https://dimensiondev.github.io/Mask-Token-List/mask.json'],
        [ChainId.Kovan]: [],
        [ChainId.Gorli]: [],
        [ChainId.Matic]: [
            'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/src/tokens/mainnet.json',
            'https://tokenmapper.api.matic.today/api/v1/mapping?map_type=[%22POS%22]&chain_id=137&limit=200&offset=200',
        ],
        [ChainId.Mumbai]: [
            'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/src/tokens/mumbai.json',
        ],
    },

    // contracts
    BALANCE_CHECKER_ADDRESS: {
        [ChainId.Mainnet]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
        [ChainId.Ropsten]: '0x1604c587BF77702c2e944a15fAACE246B72ff6f6',
        [ChainId.Rinkeby]: '0xe3AE8Ae4160680C7Ac0FB0A79F519d7D7eAe06aB',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    MULTICALL_ADDRESS: {
        [ChainId.Mainnet]: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
        [ChainId.Ropsten]: '0x53c43764255c17bd724f74c4ef150724ac50a3ed',
        [ChainId.Rinkeby]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
        [ChainId.Kovan]: '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a',
        [ChainId.Gorli]: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },

    // tokens
    WETH_ADDRESS: {
        [ChainId.Mainnet]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        [ChainId.Ropsten]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        [ChainId.Rinkeby]: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        [ChainId.Kovan]: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0x8cc8538d60901d19692F5ba22684732Bc28F54A3',
        [ChainId.Mumbai]: '',
    },
    USDC_ADDRESS: {
        [ChainId.Mainnet]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        [ChainId.Ropsten]: '0x0D9C8723B343A8368BebE0B5E89273fF8D712e3C',
        [ChainId.Rinkeby]: '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
        [ChainId.Kovan]: '0x2F375e94FC336Cdec2Dc0cCB5277FE59CBf1cAe5',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        [ChainId.Mumbai]: '',
    },
    USDT_ADDRESS: {
        [ChainId.Mainnet]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        [ChainId.Ropsten]: '0x516de3a7A567d81737e3a46ec4FF9cFD1fcb0136',
        [ChainId.Rinkeby]: '0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        [ChainId.Mumbai]: '0x3813e82e6f7098b9583FC0F33a962D02018B6803',
    },
    HUSD_ADDRESS: {
        [ChainId.Mainnet]: '0xdf574c24545e5ffecb9a659c229253d4111d87e1',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    BUSD_ADDRESS: {
        [ChainId.Mainnet]: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0xdAb529f40E671A1D4bF91361c21bf9f0C9712ab7',
        [ChainId.Mumbai]: '',
    },
    COMP_ADDRESS: {
        [ChainId.Mainnet]: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0x8505b9d2254A7Ae468c0E9dd10Ccea3A837aef5c',
        [ChainId.Mumbai]: '',
    },
    MKR_ADDRESS: {
        [ChainId.Mainnet]: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0x6f7C932e7684666C9fd1d44527765433e01fF61d',
        [ChainId.Mumbai]: '',
    },
    MASK_ADDRESS: {
        [ChainId.Mainnet]: '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074',
        [ChainId.Ropsten]: '0x5B966f3a32Db9C180843bCb40267A66b73E4f022',
        [ChainId.Rinkeby]: '0xFD9Eb54f6aC885079e7bB3E207922Bb7256E3fcb',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    MSKA_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0xe54bf69054da160c597f8b5177924b9e4b81e930',
        [ChainId.Rinkeby]: '0x960B816d6dD03eD514c03F56788279154348Ea37',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    MSKB_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0xe379c7a6ba07575a5a49d8f8ebfd04921b86917d',
        [ChainId.Rinkeby]: '0xFa4Bddbc85c0aC7a543c4b59dCfb5deB17F67D8E',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    MSKC_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0xb1465b954f893d921566d8bb4092b6f03fc8c313',
        [ChainId.Rinkeby]: '0xbE88c0E7029929f50c81690275395Da1d05745B0',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    MSKD_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0x49A6D6FE38405e21C4402CcEacd23636AbE301bf',
        [ChainId.Rinkeby]: '0x57b9bD626507421d82C7542e2877D72fE7815aFd',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    MSKE_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '0xE8f4dDB8c8b655B4e161d3480522d1d576561A4D',
        [ChainId.Rinkeby]: '0xB46e44E06B89798Af11b8fE456b4796dc9026cE0',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    DAI_ADDRESS: {
        [ChainId.Mainnet]: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        [ChainId.Ropsten]: '0x31f42841c2db5173425b5223809cf3a38fede360',
        [ChainId.Rinkeby]: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
        [ChainId.Kovan]: '0x1528F3FCc26d13F7079325Fb78D9442607781c8C',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        [ChainId.Mumbai]: '0xcB1e72786A6eb3b44C2a2429e317c8a2462CFeb1',
    },
    AMPL_ADDRESS: {
        [ChainId.Mainnet]: '0xD46bA6D942050d489DBd938a2C909A5d5039A161',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    OBK_ADDRESS: {
        [ChainId.Mainnet]: '0x75231F58b43240C9718Dd58B4967c5114342a86c',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    UST_ADDRESS: {
        [ChainId.Mainnet]: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    WBTC_ADDRESS: {
        [ChainId.Mainnet]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
        [ChainId.Mumbai]: '',
    },
    SUSHI_ADDRESS: {
        [ChainId.Mainnet]: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    YAM_ADDRESS: {
        [ChainId.Mainnet]: '0x0e2298E3B3390e3b945a5456fBf59eCc3f55DA16',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    RUNE_ADDRESS: {
        [ChainId.Mainnet]: '0x3155BA85D5F96b2d030a4966AF206230e46849cb',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    YFI_ADDRESS: {
        [ChainId.Mainnet]: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0xDA537104D6A5edd53c6fBba9A898708E465260b6',
        [ChainId.Mumbai]: '',
    },
    ETH_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        [ChainId.Mumbai]: '0x714550C2C1Ea08688607D86ed8EeF4f5E4F22323',
    },
    QUICK_ADDRESS: {
        [ChainId.Mainnet]: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13',
        [ChainId.Mumbai]: '',
    },
    MATIC_ADDRESS: {
        [ChainId.Mainnet]: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0x0000000000000000000000000000000000001010',
        [ChainId.Mumbai]: '',
    },
    WMATIC_ADDRESS: {
        [ChainId.Mainnet]: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.Matic]: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        [ChainId.Mumbai]: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
    },

    // settings
    PROVIDER_ADDRESS_LIST:
        process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.build === 'beta'
            ? {
                  [ChainId.Mainnet]: ['https://mainnet.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195'],
                  [ChainId.Ropsten]: ['https://ropsten.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195'],
                  [ChainId.Rinkeby]: ['https://rinkeby.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195'],
                  [ChainId.Kovan]: ['https://kovan.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195'],
                  [ChainId.Gorli]: ['https://goerli.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195'],
                  [ChainId.Matic]: ['https://rpc-mainnet.maticvigil.com'],
                  [ChainId.Mumbai]: ['https://rpc-mumbai.matic.today'],
              }
            : {
                  [ChainId.Mainnet]: [
                      'https://damp-holy-water.quiknode.pro/d5bcb6c5e265afd11fecb0d52275afa961487a29/',
                      'https://mainnet.infura.io/v3/50676f4e9b9d4780a34fc8a503ff7f4f',
                      'https://throbbing-blue-bird.quiknode.io/73e66978-1a45-4f91-97f3-25d59b51a00e/YScEAjYfzZqNphokjzn-Zt3sZsOd0Nav5sauA3j03se0LOseR8PQFyBfINzhYStWrg44VfLLfCFE34FR2CA_kQ==/',
                      'http://api.taichi.network:10000/rpc/112c84849b6014ce1b970d8b81e9bb4a',
                  ],
                  [ChainId.Ropsten]: ['https://ropsten.infura.io/v3/11f8b6b36f4a408e85d8a4e52d31edc5'],
                  [ChainId.Rinkeby]: ['https://rinkeby.infura.io/v3/11f8b6b36f4a408e85d8a4e52d31edc5'],
                  [ChainId.Kovan]: ['https://kovan.infura.io/v3/11f8b6b36f4a408e85d8a4e52d31edc5'],
                  [ChainId.Gorli]: ['https://goerli.infura.io/v3/11f8b6b36f4a408e85d8a4e52d31edc5'],
                  [ChainId.Matic]: ['https://goerli.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195'],
                  [ChainId.Mumbai]: ['https://goerli.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195'],
              },
    PROVIDER_WEIGHT_LIST: {
        [ChainId.Mainnet]:
            process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.build === 'beta'
                ? [0, 0, 0, 0, 0] // 0 - 100%
                : [0, 0, 1, 2, 3], // 0 - 40%, 1 - 20%, 2 - 20%, 3 - 20%
        [ChainId.Ropsten]: [0, 0, 0, 0, 0], // 0 - 100%
        [ChainId.Rinkeby]: [0, 0, 0, 0, 0], // 0 - 100%
        [ChainId.Kovan]: [0, 0, 0, 0, 0], // 0 - 100%
        [ChainId.Gorli]: [0, 0, 0, 0, 0], // 0 - 100%
        [ChainId.Matic]: [0, 0, 0, 0, 0], // 0 - 100%
        [ChainId.Mumbai]: [0, 0, 0, 0, 0], // 0 - 100%
    },
    WALLET_CONNECT_BRIDGE: {
        [ChainId.Mainnet]: ['https://bridge.walletconnect.org'],
        [ChainId.Ropsten]: ['https://bridge.walletconnect.org'],
        [ChainId.Rinkeby]: ['https://bridge.walletconnect.org'],
        [ChainId.Kovan]: ['https://bridge.walletconnect.org'],
        [ChainId.Gorli]: ['https://bridge.walletconnect.org'],
        [ChainId.Matic]: ['https://walletconnect.matic.network'],
        [ChainId.Mumbai]: ['https://bridge.walletconnect.matic.today'],
    },
}
