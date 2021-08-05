import BigNumber from 'bignumber.js'
import { escapeRegExp } from 'lodash-es'

export const POOLTOGETHER_PLUGIN_ID = 'com.pooltogether'

export const BASE_URL = 'pooltogether.com'
export const APP_URL = 'https://app.pooltogether.com'
export const API_URL = 'https://pooltogether-api.com/'
export const COMMINUTY_URL = 'https://community.pooltogether.com/'

export const URL_PATTERN = new RegExp(`(http|https)\:\/\/.*\.?${escapeRegExp(BASE_URL)}`)

export const ONE_SECOND = 1000
export const ONE_DAY_SECONDS = 86400
export const ONE_WEEK_SECONDS = ONE_DAY_SECONDS * 7

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const SECONDS_PER_BLOCK = 14
export const WEI_PER_ETHER = new BigNumber(10).pow(18)
