import { escapeRegExp } from 'lodash-unified'

export const DHEDGE_PLUGIN_ID = 'org.dhedge'
export const POOL_DESCRIPTION_LIMIT = 210
export const BLOCKIES_OPTIONS = {
    color: '#cb7a89',
    bgcolor: '#91f5a9',
    size: 7,
    scale: 16,
}
export const API_URL = 'https://api-v2.dhedge.org/graphql'
export const BASE_URL = 'https://app.dhedge.org'
export const STAGING_URL = 'https://dh-pre-prod.web.app'

export function createMatchLink() {
    return new RegExp(`(${escapeRegExp(BASE_URL)}|${escapeRegExp(STAGING_URL)})/pool/(\\w+)`)
}
