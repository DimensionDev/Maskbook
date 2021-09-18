import { escapeRegExp } from 'lodash-es'

export const BARNBRIDGE_PLUGIN_ID = 'com.barnbridge'

export const BASE_URL = 'barnbridge.com'
export const APP_URL = 'https://app.barnbridge.com/'
export const API_URL = 'https://api-v2.barnbridge.com/'
export const SY_URL_FRAGMENT = 'smart-yield/'

export const URL_PATTERN = new RegExp(`https?\:\/\/.*\.?${escapeRegExp(BASE_URL)}`)

export const ONE_SECOND = 1000
export const ONE_DAY_SECONDS = 86400
export const ONE_WEEK_SECONDS = ONE_DAY_SECONDS * 7

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// COLORS
export const COLOR_BARNBRIDGE_ORANGE = '#ff4339'
export const COLOR_BARNBRIDGE_BACKGROUND_DARK = '#202529'
export const COLOR_BARNBRIDGE_BACKGROUND_CARD_DARK = '#282c30'
export const COLOR_SY_SENIOR_TEXT = '#00d395'
export const COLOR_SY_JUNIOR_TEXT = '#a26ee3'

// Strings
export const BB_SY_CREAM = 'C.R.E.A.M FINANCE'
export const BB_SY_AAVE = 'AAVE'
export const BB_SY_COMPOUND = 'Compound'
