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

export const PRECISION = 10000

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
        // "Factory": "0x9c955d3deb8696F1753388068dC9480B1441F0ea"
        'BTC-USDT': '0xc0b12d35B26450e45DcBd35D5f9bec81C771Ab08',
        'BTC-USDC': '0xA021911835198CA418568467c7b9888C7A1CC088',
        'BTC-DAI': '0xf62e1729a44F74Cc76Eb59E1c138525CEDfC9C34',
        // "ETH-GAS-USDT": "0xD94cB7131e6cB9255d73E1d51777bc67831625fe",
    },
    80001: {
        // "Factory": "0x0b272a52E64542C7B2bfe001fFe6EaD1Ae24c4B8"
        'BTC-USDT': '0x3a123D3AA9cBd4F6e04A444595911055945Ab7F8',
        'BTC-USDC': '0xE90648A054D6008633a6f6f61b9DcB734E2A76B9',
        'BTC-DAI': '0xf64A88fF8e7420cd755dc7554e42a7B1BfBDeaCd',
    },
}

export const pids = { 42: [0, 1, 2], 80001: [0, 1, 2] }

export const sponsorFarmPoolIdMap = {
    42: {
        'BTC-USDT': 0,
        'BTC-USDC': 1,
        'BTC-DAI': 2,
        // "ETH-GAS-USDT": 14,
    },
    80001: {
        'BTC-USDT': 0,
        'BTC-USDC': 1,
        'BTC-DAI': 2,
    },
}

export const sponsorFarmAddress = {
    42: '0x159e02795eaD816cE0792F932BE7B36444F82dC6',
    80001: '0x35983140e2477F797343f376B59689B94da1a87D',
}

export const erpToken = {
    42: new Token(42, '0x0bCe57a3B09Cd2Bde97970bEceaEf5990fF386b1', 18, 'ERP'),
    80001: new Token(80001, '0x775D2b13D9D80e7691Cf9C223567481B2A278755', 18, 'ERP'),
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
            shortToken: new Token(42, '0xC9A28f3784A4Cc9eAC0397EED7B50302c4C855cB', 6, 'stBTC-USDT', 'stbtc usdt'),
            longToken: new Token(42, '0x461926675233Aa57f99531488118fc205161585F', 6, 'lgBTC-USDT', 'lgbtc usdt'),
            sponsorToken: new Token(42, '0x7f7Dac0b08BC0fd439717A086240d6c504F30C87', 6, 'spBTC-USDT', 'spbtc usdt'),
        },
        'BTC-USDC': {
            principalToken: new Token(42, '0xe22da380ee6B445bb8273C81944ADEB6E8450422', 6, 'USDC'),
            shortToken: new Token(42, '0x8D502719c063fcA41ab12a6C40a554aD2F81f7E4', 6, 'stBTC-USDC', 'stbtc usdc'),
            longToken: new Token(42, '0xdE89F4386577B2d6041Cc096D09FBceef9FEfeE1', 6, 'lgBTC-USDC', 'lgbtc usdc'),
            sponsorToken: new Token(42, '0xfb7D894418fE9E477Eb3C76E769eaC958A7F9fEf', 6, 'spBTC-USDC', 'spbtc usdc'),
        },
        'BTC-DAI': {
            principalToken: new Token(42, '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD', 18, 'DAI'),
            shortToken: new Token(42, '0x88E30b9409C89485e5702869b0df4e70a00D5042', 18, 'stBTC-DAI', 'stbtc dai '),
            longToken: new Token(42, '0xb0150779DE95b365D058Adf0Dfde8F2301f8565f', 18, 'lgBTC-DAI', 'lgbtc dai'),
            sponsorToken: new Token(42, '0x8f64022B225cc620577a8a0D2C7B9ed19718832D', 18, 'spBTC-DAI', 'spbtc dai'),
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
            shortToken: new Token(80001, '0xe6cF8305fd2b867aD6290FC4E96499d872908426', 6, 'stBTC-USDT', 'stbtc usdt'),
            longToken: new Token(80001, '0xE51a5e509D1Abe852F2BdD88CEe6D048c9025900', 6, 'lgBTC-USDT', 'lgbtc usdt'),
            sponsorToken: new Token(
                80001,
                '0x686B96F29d194295a063e465Cf742bF1167f88f6',
                6,
                'spBTC-USDT',
                'spbtc usdt ',
            ),
        },
        'BTC-USDC': {
            principalToken: new Token(80001, '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e', 6, 'USDC'),
            shortToken: new Token(80001, '0x031db0443f61d4ebc7f7627A84A8c033B687fb64', 6, 'stBTC-USDC', 'stbtc usdc'),
            longToken: new Token(80001, '0x499040aEc3003E4Ecf8bb6Fc8c1763c763C48634', 6, 'lgBTC-USDC', 'lgbtc usdc'),
            sponsorToken: new Token(80001, '0x82EaB29dEdb55844f0CF63e1B00E90945a9Dfb7e', 6, 'spBTC-USDC', 'spbtc usdc'),
        },
        'BTC-DAI': {
            principalToken: new Token(80001, '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F', 18, 'DAI'),
            shortToken: new Token(80001, '0x4cF66e5C79082Ba1e3E392787293980C4C607A57', 18, 'stBTC-DAI', 'stbtc dai '),
            longToken: new Token(80001, '0xA4509E20cAdCce935B6f5FB747DA20d454d0a37B', 18, 'lgBTC-DAI', 'lgbtc dai'),
            sponsorToken: new Token(80001, '0x7dDD1df05f40f84f2294d393E9727fd0c6C92B79', 18, 'spBTC-DAI', 'spbtc dai'),
        },
    },
}
