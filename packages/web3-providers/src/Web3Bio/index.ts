import urlcat from 'urlcat'
import { EMPTY_LIST, createBindingProofFromProfileQuery, NextIDPlatform, type BindingProof } from '@masknet/shared-base'
import type { Web3BioBaseAPI } from '../types/Web3Bio.js'
import { fetchCachedJSON } from '../helpers/fetchJSON.js'
import { WEB3_BIO_ROOT_URL } from './constants.js'
import type { Web3BioProfile } from './types.js'

export class Web3BioAPI implements Web3BioBaseAPI.Profile {
    fetchFromWeb3Bio<T>(request: Request | RequestInfo, init?: RequestInit) {
        return fetchCachedJSON<T>(request, init)
    }

    async queryProfilesByAddress(address: string) {
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
}
