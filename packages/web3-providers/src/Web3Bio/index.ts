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

function patchProfile(profile: Web3BioProfile): Web3BioProfile {
    if (profile.platform === NextIDPlatform.Farcaster && profile.social?.uid) {
        return {
            ...profile,
            identity: profile.social.uid.toString(),
        }
    }
    return profile
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
        const res = await Web3Bio.fetchFromWeb3Bio<Response<Web3BioProfile[]>>(url)
        return Array.isArray(res) ? res.map(patchProfile) : []
    }

    /** Get profiles by address or domain */
    static async getProfilesBy(domainOrAddress: string) {
        const url = urlcat(WEB3_BIO_HOST, '/profile/:id', { id: domainOrAddress })
        const res = await Web3Bio.fetchFromWeb3Bio<Response<Web3BioProfile[]>>(url)
        return Array.isArray(res) ? res.map(patchProfile) : []
    }

    static async getProfilesByNextId(pubkey: string) {
        const url = urlcat(WEB3_BIO_HOST, '/profile/nextid,:pubkey', { pubkey })
        const res = await Web3Bio.fetchFromWeb3Bio<Response<Web3BioProfile[]>>(url)
        return Array.isArray(res) ? res.map(patchProfile) : []
    }

    static async getAllLens(twitterId: string) {
        const profiles = await Web3Bio.getProfilesByTwitterId(twitterId)
        return profiles.filter((x) => x.platform === NextIDPlatform.LENS)
    }
}
