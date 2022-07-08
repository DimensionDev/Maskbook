import urlcat from 'urlcat'

export const NFTSCAN_BASE = 'https://www.nftscan.com'
export const NFTSCAN_LOGO_BASE = 'https://logo.nftscan.com/logo'
export const NFTSCAN_URL = 'https://restapi.nftscan.com'
export const NFTSCAN_BASE_API = urlcat(NFTSCAN_URL, '/api/v1')
export const NFTSCAN_ACCESS_TOKEN_URL = urlcat(NFTSCAN_URL, '/gw/token')
