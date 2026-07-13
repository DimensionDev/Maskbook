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

export class Web3Bio {
    static fetchFromWeb3Bio<T>(request: Request | RequestInfo, init?: RequestInit) {
        return fetchCachedJSON<T>(request, {
            ...init,
            headers: {
                'X-API-KEY': `Bearer ${WEB3_BIO_JWT}`,
            },
        })
    }

    static async getProfilesByTwitterId(handle: string) {
        const url = urlcat(WEB3_BIO_HOST, `/profile/twitter,${handle.toLowerCase()}`)
        const profiles = await this.fetchFromWeb3Bio<Response<Web3BioProfile[]>>(url)
        return Array.isArray(profiles) ? profiles : []
    }

    /** Get profiles by address or domain */
    static async getProfilesBy(domainOrAddress: string) {
        const url = urlcat(WEB3_BIO_HOST, '/profile/:id', { id: domainOrAddress })
        const profiles = await this.fetchFromWeb3Bio<Response<Web3BioProfile[]>>(url)
        return Array.isArray(profiles) ? profiles : []
    }

    static async getAllLens(twitterId: string) {
        const profiles = await this.getProfilesByTwitterId(twitterId)
        return profiles.filter((x) => x.platform === NextIDPlatform.LENS)
    }
}
