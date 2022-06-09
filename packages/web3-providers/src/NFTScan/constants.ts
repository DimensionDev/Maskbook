import urlcat from 'urlcat'
import { courier } from '../helpers'

export const NFTSCAN_ID = 't9k2o5GC'
export const NFTSCAN_BASE = 'https://www.nftscan.com'
export const NFTSCAN_LOGO_BASE = 'https://logo.nftscan.com/logo'
export const NFTSCAN_SECRET = '21da1d638ef5d0bf76e37aa5c2da7fd789ade9e3'
export const NFTSCAN_URL = 'https://restapi.nftscan.com'
export const NFTSCAN_BASE_API = urlcat(NFTSCAN_URL, '/api/v1')
export const NFTSCAN_ACCESS_TOKEN_URL = courier(
    urlcat(NFTSCAN_URL, '/gw/token', {
        apiKey: NFTSCAN_ID,
        apiSecret: NFTSCAN_SECRET,
    }),
)
