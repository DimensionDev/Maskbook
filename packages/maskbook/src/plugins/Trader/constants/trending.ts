//#region plugin settings
export const PLUGIN_IDENTIFIER = 'com.maskbook.trader'
//#endregion

//#region apis
export const COIN_GECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

// proxy: https://web-api.coinmarketcap.com/v1
export const CMC_V1_BASE_URL = 'https://coinmarketcap-agent.r2d2.to/v1'

export const THIRD_PARTY_V1_BASE_URL = 'https://3rdparty-apis.coinmarketcap.com/v1'
//#endregion

// the bitcoin ledger started at 03 Jan 2009
export const BTC_FIRST_LEGER_DATE = new Date('2009-01-03T00:00:00.000Z')

// settings about trader
export const CRYPTOCURRENCY_MAP_EXPIRES_AT = 60 /* seconds */ * 1000 /* milliseconds */

// the max length of approved tokens
export const APPROVED_TOKENS_MAX = 10
