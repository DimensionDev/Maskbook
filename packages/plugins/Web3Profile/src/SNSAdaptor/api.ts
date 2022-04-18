import urlcat from 'urlcat'
import { Response, AssetType } from './types'

async function fetchJSON<T = unknown>(url: string): Promise<T> {
    const res = await globalThis.fetch(url)
    return res.json()
}

export function getDonations(address: string) {
    const url = urlcat('https://hub.pass3.me/assets/list', {
        personaID: address,
        type: AssetType.GitcoinDonation,
    })

    return fetchJSON<Response>(url)
}

export function getFootprints(address: string): Promise<Response> {
    const url = urlcat('https://hub.pass3.me/assets/list', {
        personaID: address,
        type: AssetType.POAP,
    })

    return fetchJSON<Response>(url)
}
