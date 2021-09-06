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
