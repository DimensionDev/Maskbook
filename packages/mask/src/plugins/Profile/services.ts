import urlcat from 'urlcat'
import { fetchJSON } from '../../extension/background-script/HelperService'
import type { GeneralAsset } from './apis/types'

export * from './apis'

interface Response {
    status: boolean
    assets: GeneralAsset[]
}

export function getDonations(account: string): Promise<Response> {
    const url = urlcat('https://hub.pass3.me/assets/list', {
        personaID: account,
        type: 'Gitcoin-Donation',
    })

    return fetchJSON(url) as Promise<Response>
}

export function getFootprints(account: string): Promise<Response> {
    const url = urlcat('https://hub.pass3.me/assets/list', {
        personaID: account,
        type: 'POAP',
    })

    return fetchJSON(url) as Promise<Response>
}
