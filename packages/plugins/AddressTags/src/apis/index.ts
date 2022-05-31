import urlcat from 'urlcat'
import { DefProfile, GeneralAsset, POAPAction, RSS3Profile } from '../types'

async function fetchJSON<T = unknown>(url: RequestInfo | URL, config?: RequestInit): Promise<T> {
    const res = await globalThis.fetch(url, config)
    return res.json()
}

interface Response {
    status: boolean
    assets: GeneralAsset[]
}

interface NameInfo {
    rnsName: string
    ensName: string | null
    address: string
}

interface RSS3Info {
    profile: RSS3Profile
}

export function getPOAPActions(address: string) {
    const url = urlcat('https://api.poap.xyz/actions/scan/:id', {
        id: address,
    })
    return fetchJSON<POAPAction[]>(url)
}

export function getDefProfile(address: string) {
    const url = urlcat('https://www.def.network/api/profiles/:id', {
        id: address,
    })
    return fetchJSON<DefProfile>(url)
}
