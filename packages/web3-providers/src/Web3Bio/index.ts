import urlcat from 'urlcat'
import { NextIDPlatform, type Web3BioProfile } from '@masknet/shared-base'
import { fetchCachedJSON } from '../helpers/fetchJSON.js'
import { WEB3_BIO_HOST, WEB3_BIO_JWT } from './constants.js'

type Response<T> =
    | T
    | {
          address: null
          identity: string
          platform: string
          error: string
      }

export const Web3Bio = {
    fetchFromWeb3Bio<T>(request: Request | RequestInfo, init?: RequestInit) {
        return fetchCachedJSON<T>(request, {
            ...init,
            headers: {
                'X-API-KEY': `Bearer ${WEB3_BIO_JWT}`,
            },
        })
    },

    async getProfilesByTwitterId(handle: string) {
        const url = urlcat(WEB3_BIO_HOST, `/profile/twitter,${handle.toLowerCase()}`)
        const profiles = await Web3Bio.fetchFromWeb3Bio<Response<Web3BioProfile[]>>(url)
        return Array.isArray(profiles) ? profiles : []
    },

    /** Get profiles by address or domain */
    async getProfilesBy(domainOrAddress: string) {
        const url = urlcat(WEB3_BIO_HOST, '/profile/:id', { id: domainOrAddress })
        const profiles = await Web3Bio.fetchFromWeb3Bio<Response<Web3BioProfile[]>>(url)
        return Array.isArray(profiles) ? profiles : []
    },

    async getAllLens(twitterId: string) {
        const profiles = await Web3Bio.getProfilesByTwitterId(twitterId)
        return profiles.filter((x) => x.platform === NextIDPlatform.LENS)
    },
}
