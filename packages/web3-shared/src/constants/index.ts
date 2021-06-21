import { ChainId } from '../types'

export * from './tokens'

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
        [ChainId.Kovan]: ['https://irhonin.github.io/kovan-token-list/kovan-token-list.json'],
        [ChainId.Gorli]: [],
        [ChainId.BSC]: ['https://dimensiondev.github.io/Mask-Token-List/mask.json'],
        [ChainId.BSCT]: ['https://dimensiondev.github.io/Mask-Token-List/mask.json'],
        [ChainId.Matic]: ['https://dimensiondev.github.io/Mask-Token-List/mask.json'],
        [ChainId.Mumbai]: ['https://dimensiondev.github.io/Mask-Token-List/mask.json'],
    },

    // contracts
    BALANCE_CHECKER_ADDRESS: {
        [ChainId.Mainnet]: '0xb1F8e55c7f64D203C1400B9D8555d050F94aDF39',
        [ChainId.Ropsten]: '0x1604c587BF77702c2e944a15fAACE246B72ff6f6',
        [ChainId.Rinkeby]: '0xe3AE8Ae4160680C7Ac0FB0A79F519d7D7eAe06aB',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '0xC119574D5Fb333F5AC018658D4d8b5035E16bf39',
        [ChainId.BSCT]: '0x7f004a42D760Eb68eB95Fa50f739917675181fCA',
        [ChainId.Matic]: '0x6cc1b1058F9153358278C35E0b2D382f1585854B',
        [ChainId.Mumbai]: '0xFEd05EE9b7DdbAb97Abc55e27EF95C7c14688Aad',
    },
    MULTICALL_ADDRESS: {
        [ChainId.Mainnet]: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
        [ChainId.Ropsten]: '0x53c43764255c17bd724f74c4ef150724ac50a3ed',
        [ChainId.Rinkeby]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
        [ChainId.Kovan]: '0x2cc8688c5f75e365aaeeb4ea8d6a480405a48d2a',
        [ChainId.Gorli]: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
        [ChainId.BSC]: '0x59CED6942f5506bc01e5D438e7ce3D4635271659',
        [ChainId.BSCT]: '0x6e5BB1a5Ad6F68A8D7D6A5e47750eC15773d6042',
        [ChainId.Matic]: '0xC119574D5Fb333F5AC018658D4d8b5035E16bf39',
        [ChainId.Mumbai]: '0x6B70EC653c4331bdD0D0DCC7C941eb594e69a91d',
    },
}
