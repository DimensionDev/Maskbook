import { escapeRegExp } from 'lodash-unified'

export const POOLTOGETHER_PLUGIN_ID = 'com.pooltogether'

export const BASE_URL = 'pooltogether.com'
export const APP_URL = 'https://app.pooltogether.com'
export const API_URL = 'https://pooltogether-api.com/'
export const COMMUNITY_URL = 'https://community.pooltogether.com/'

export const URL_PATTERN = new RegExp(`(http|https)\:\/\/.*\.?${escapeRegExp(BASE_URL)}`)

export const ONE_SECOND = 1000
export const ONE_DAY_SECONDS = 86400
export const ONE_WEEK_SECONDS = ONE_DAY_SECONDS * 7
