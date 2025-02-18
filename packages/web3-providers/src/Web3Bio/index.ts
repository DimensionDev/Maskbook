import urlcat from 'urlcat'
import {
    EMPTY_LIST,
    createBindingProofFromProfileQuery,
    NextIDPlatform,
    type BindingProof,
    type Web3BioProfile,
} from '@masknet/shared-base'
import { fetchCachedJSON } from '../helpers/fetchJSON.js'
import { WEB3_BIO_HOST, WEB3_BIO_ROOT_URL } from './constants.js'

export class Web3Bio {
    static fetchFromWeb3Bio<T>(request: Request | RequestInfo, init?: RequestInit) {
        return fetchCachedJSON<T>(request, init)
    }

    static async queryProfilesByAddress(address: string) {
        const { links = EMPTY_LIST } = await this.fetchFromWeb3Bio<Web3BioProfile>(
            urlcat(WEB3_BIO_ROOT_URL, '/ens/:address', { address }),
        )

        const BindingProofs = Object.entries(links)
            .map((x) => {
                const platform = x[0] as NextIDPlatform
                if (!Object.values(NextIDPlatform).includes(platform)) return
                const { handle, link } = x[1]
                return createBindingProofFromProfileQuery(platform, handle, handle, link)
            })
            .filter(Boolean) as BindingProof[]

        return BindingProofs
    }
    static async getProfilesByTwitterId(handle: string) {
        const url = urlcat(WEB3_BIO_HOST, `/profile/twitter,${handle}`)
        return fetchCachedJSON<Web3BioProfile[]>(url)
    }

    /** Get profiles by address or domain */
    static async getProfilesBy(domainOrAddress: string) {
        const url = urlcat(WEB3_BIO_HOST, '/profile/:id', { id: domainOrAddress })
        return fetchCachedJSON<Web3BioProfile[]>(url)
    }

    static async getProfilesByNextId(pubkey: string) {
        const url = urlcat(WEB3_BIO_HOST, '/profile/nextid,:pubkey', { pubkey })
        return fetchCachedJSON<Web3BioProfile[]>(url)
    }

    static async getAllLens(twitterId: string) {
        const profiles = await Web3Bio.getProfilesByTwitterId(twitterId)
        return profiles.filter((x) => x.platform === NextIDPlatform.LENS)
    }
}
