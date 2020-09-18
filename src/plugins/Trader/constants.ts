import { ChainId, ERC20Token } from '../../web3/types'
import { getConstant } from '../../web3/constants'
import { createERC20 } from './helpers'
import MAINNET_AGAINST_TOKENS from './erc20/mainnet.json'
import RINKEBY_AGAINST_TOKENS from './erc20/rinkeby.json'

//#region plugin definitions
export const PLUGIN_IDENTIFIER = 'co.maskbook.trader'
export const PLUGIN_METADATA_KEY = 'com.maskbook.trader:1'
//#endregion

//#region apis
export const COIN_GECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

// proxy: https://web-api.coinmarketcap.com/v1
export const CMC_V1_BASE_URL = 'https://coinmarketcap.provide.maskbook.com/v1'

// proxy: https://web-api.coinmarketcap.com/v1.1
export const CMC_V2_BASE_URL = 'https://widgets.coinmarketcap.com/v2'
//#endregion

// the bitcoin ledger started at 03 Jan 2009
export const BTC_FIRST_LEGER_DATE = new Date('2009-01-03T00:00:00.000Z')

//#region settings about trader
export const CRYPTOCURRENCY_MAP_EXPIRES_AT =
    24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* milliseconds */
//#endregion

//#region settings about uniswap
export const MIN_AMOUNT_LENGTH = 1
export const MAX_AMOUNT_LENGTH = 79

type ChainTokenList = {
    readonly [chainId in ChainId]: ERC20Token[]
}

const WETH_ONLY: ChainTokenList = {
    [ChainId.Mainnet]: [
        createERC20(ChainId.Mainnet, getConstant(ChainId.Mainnet, 'WETH_ADDRESS'), 18, 'Wrapped Ether', 'WETH'),
    ],
    [ChainId.Ropsten]: [
        createERC20(ChainId.Ropsten, getConstant(ChainId.Ropsten, 'WETH_ADDRESS'), 18, 'Wrapped Ether', 'WETH'),
    ],
    [ChainId.Rinkeby]: [
        createERC20(ChainId.Rinkeby, getConstant(ChainId.Rinkeby, 'WETH_ADDRESS'), 18, 'Wrapped Ether', 'WETH'),
    ],
    [ChainId.Kovan]: [],
}

export const BASE_AGAINST_TOKENS = {
    ...WETH_ONLY,
    [ChainId.Mainnet]: [
        ...WETH_ONLY[ChainId.Mainnet],
        ...MAINNET_AGAINST_TOKENS.against_tokens.map((x) =>
            createERC20(ChainId.Mainnet, x.address, x.decimals, x.name, x.symbol),
        ),
    ],
    [ChainId.Rinkeby]: [
        ...WETH_ONLY[ChainId.Rinkeby],
        ...RINKEBY_AGAINST_TOKENS.against_tokens.map((x) =>
            createERC20(ChainId.Rinkeby, x.address, x.decimals, x.name, x.symbol),
        ),
    ],
}
//#endregion
