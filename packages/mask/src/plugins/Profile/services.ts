import urlcat from 'urlcat'
import { fetchJSON } from '../../extension/background-script/HelperService'
import { AssetType, GeneralAsset, RSS3Profile } from './types'

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

export async function getRSS3AddressById(id: string) {
    if (!id) return ''
    const url = urlcat('https://rss3.domains/name/:id', { id })
    const rsp = await fetchJSON<NameInfo>(url)
    return rsp.address
}

export async function getRSS3ProfileByAddress(address: string) {
    if (!address) return
    const url = urlcat('https://hub.pass3.me/:address', { address })
    const rsp = await fetchJSON<RSS3Info>(url)
    return rsp?.profile
}
