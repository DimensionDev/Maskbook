import { escapeRegExp } from 'lodash-es'

// import { escapeRegExp } from 'lodash-es'
export const ENTROPYFI_PLUGIN_ID = 'com.entropyfi'
export const ENTROPYFI_PLUGIN_NAME = 'Entropyfi'
export const ENTROPYFI_PLUGIN_ICON = ''
export const ENTROPYFI_PLUGIN_DESCRIPTION = 'Entropyfi: Supercharge your yield with your prediction skill'

export const ENTROPYFI_BASE_URL = 'entropyfi.com'
export const ENTROPYFI_APP_URL = 'https://app.entropyfi.com/'
export const ENTROPYFI_API_URL = 'https://tan-zixuan.github.io/entropy-api/data.json'
export const ENTROPYFI_URL_PATTERN = new RegExp(`(http|https)\:\/\/.*\.?${escapeRegExp(ENTROPYFI_BASE_URL)}`)

export const ONE_SECOND = 1000
export const ONE_DAY_SECONDS = 86400
export const ONE_WEEK_SECONDS = ONE_DAY_SECONDS * 7

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

import { Token } from '@uniswap/sdk-core'

export enum PoolId {
    'BTC-USDT' = 0,
    'BTC-USDC' = 1,
    'BTC-DAI' = 2,
    'ETH-GAS-USDT' = 3,
}

export enum PoolStatus {
    FirstGame = 0,
    Locked = 1,
    Accepting = 2,
    Terminated = 3,
}

export const poolAddressMap: IPoolAddressesMap = {
    42: {
        'BTC-USDT': '0x2c16E95E5F564523472B535017152793404bA92F',
        'BTC-USDC': '0x70af040F788f1030Ed0f3408E8d8E1b42A9c53Cf',
        'BTC-DAI': '0x4C3D085F1afC723D8a96F4416f7079e481bb951c',
        'ETH-GAS-USDT': '0xD94cB7131e6cB9255d73E1d51777bc67831625fe',
    },
    80001: {
        'BTC-USDT': '0xb3CE6EafAB34eFf9753Bf494729bA084f6a73d90',
        'BTC-USDC': '0xfC0dEeFbb5B61688e2Fae57D161c4DB219C63926',
        'BTC-DAI': '0x6bD942Ce0706EE80518626313B6b743fa89346ea',
    },
}

export const pids = { 42: [11, 12, 13, 14], 80001: [0, 1, 2] }

export const sponsorFarmPoolIdMap = {
    42: {
        'BTC-USDT': 11,
        'BTC-USDC': 12,
        'BTC-DAI': 13,
        'ETH-GAS-USDT': 14,
    },
    80001: {
        'BTC-USDT': 0,
        'BTC-USDC': 1,
        'BTC-DAI': 12,
    },
}

export const sponsorFarmAddress = {
    42: '0x13f65279289bf20aa7183c50f55e13dc4a96fbac',
    80001: '0xDB6Fdd6a0c1F8e2f9E932FC254e164F29CE8c131',
}

export const erpToken = {
    42: new Token(42, '0x9310f696ed81db25cd0fb85c12e980122df54afc', 18, 'ERP'),
    80001: new Token(80001, '0xeF72681684a4ab4Cb7b662BE970a9ac0ebB6B019', 18, 'ERP'),
}

export type IPoolAddressesMap = {
    [chainId: number]: {
        [poolId: string]: string
    }
}

export type ISonpsorFarmPoolIdMap = {
    [chainId: number]: {
        [poolId: string]: number
    }
}

export type TokenMap = {
    [chainId: number]: {
        [poolId: string]: {
            [tokenType: string]: Token
        }
    }
}

export const tokenMap: TokenMap = {
    42: {
        'BTC-USDT': {
            principalToken: new Token(42, '0x13512979ADE267AB5100878E2e0f485B568328a4', 6, 'USDT', 'USDT Coin'),
            shortToken: new Token(42, '0x3a8961826902d7c95bed56b71ae41244c919b954', 6, 'stBTC-USDT', 'stbtc usdt'),
            longToken: new Token(42, '0x50858cf10c0d067aab4994049819ccffe22fd9d6', 6, 'lgBTC-USDT', 'lgbtc usdt'),
            sponsorToken: new Token(42, '0x5b61b311f0ff4d90ef03d6388bf180e6f652bd4d', 6, 'spBTC-USDT', 'spbtc usdt'),
        },
        'BTC-USDC': {
            principalToken: new Token(42, '0xe22da380ee6B445bb8273C81944ADEB6E8450422', 6, 'USDC'),
            shortToken: new Token(42, '0x832fb073765ce3c85ad93ac4d90ed083a7d5851e', 6, 'stBTC-USDC', 'stbtc usdc'),
            longToken: new Token(42, '0x9c114b2d95f1bcc0ac2fe7a57d7fcc62d260fbf4', 6, 'lgBTC-USDC', 'lgbtc usdc'),
            sponsorToken: new Token(42, '0x55ff071dc0fc612be13b16eb31d08f649daf0933', 6, 'spBTC-USDC', 'spbtc usdc'),
        },
        'BTC-DAI': {
            principalToken: new Token(42, '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD', 18, 'DAI'),
            shortToken: new Token(42, '0x9d107da5f0e5c4eec3700717311927f9fdfbd537', 18, 'stBTC-DAI', 'stbtc dai '),
            longToken: new Token(42, '0xd042d0ca69a0afc33cce19621cb3e66a54f67f5a', 18, 'lgBTC-DAI', 'lgbtc dai'),
            sponsorToken: new Token(42, '0x238fa703b1eba23d28a5105f50d79156d57ec540', 18, 'spBTC-DAI', 'spbtc dai'),
        },
        'ETH-GAS-USDT': {
            principalToken: new Token(42, '0x13512979ade267ab5100878e2e0f485b568328a4', 6, 'USDT', 'USDT Coin'),
            shortToken: new Token(42, '0xcd43ae6fc7531049352bc802926c703b7352a21b', 6, 'stBTC-USDT'),
            longToken: new Token(42, '0x68ddb4c5eb8ab55dfffb06a50b4a89c4f37f4ae7', 6, 'lgBTC - USDT'),
            sponsorToken: new Token(42, '0xec7ed93d77368a0101cef1a3cb8af79ede1dfec0', 6, 'spBTC-USDT'),
        },
    },
    80001: {
        'BTC-USDT': {
            principalToken: new Token(80001, '0xBD21A10F619BE90d6066c941b04e340841F1F989', 6, 'USDT', 'USDT Coin'),
            shortToken: new Token(80001, '0x85aE0fC733bC71f693428Fdf35EAd6d5eDB2573E', 6, 'stBTC-USDT', 'stbtc usdt'),
            longToken: new Token(80001, '0x2a5B2e1B41a3c2Ec5537d8A8Ba304009d0906206', 6, 'lgBTC-USDT', 'lgbtc usdt'),
            sponsorToken: new Token(
                80001,
                '0x9D9a2a17d73bC81bE9C6B343358e4B2f9aAf34b5',
                6,
                'spBTC-USDT',
                'spbtc usdt ',
            ),
        },
        'BTC-USDC': {
            principalToken: new Token(80001, '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e', 6, 'USDC'),
            shortToken: new Token(80001, '0xe05AD6EbA8F6C4D37b8C7f2784F84Dd236821416', 6, 'stBTC-USDC', 'stbtc usdc'),
            longToken: new Token(80001, '0xf29D0D202979D3D7DA1F3579e820e57B82C8FDaC', 6, 'lgBTC-USDC', 'lgbtc usdc'),
            sponsorToken: new Token(80001, '0x5E0Fd77825F6686b4DC0008E91df6052CB548da7', 6, 'spBTC-USDC', 'spbtc usdc'),
        },
        'BTC-DAI': {
            principalToken: new Token(80001, '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F', 18, 'DAI'),
            shortToken: new Token(80001, '0x0C157C7347286ca60Dec75Ac13E6A96383a84E67', 18, 'stBTC-DAI', 'stbtc dai '),
            longToken: new Token(80001, '0x401245643b437C0e5822A6897384e4082A906EC2', 18, 'lgBTC-DAI', 'lgbtc dai'),
            sponsorToken: new Token(80001, '0x19d5B6EC65FE9DdcEc5012257704434f5E56C5Dc', 18, 'spBTC-DAI', 'spbtc dai'),
        },
    },
}
