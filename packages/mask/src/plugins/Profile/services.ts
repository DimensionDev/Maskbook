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

export function getDonations(account: string) {
    const url = urlcat('https://hub.pass3.me/assets/list', {
        personaID: account,
        type: AssetType.GitcoinDonation,
    })

    return fetchJSON<Response>(url)
}

export function getFootprints(account: string): Promise<Response> {
    const url = urlcat('https://hub.pass3.me/assets/list', {
        personaID: account,
        type: AssetType.POAP,
    })

    return fetchJSON<Response>(url)
}

export async function getAddressByRss3Id(id: string) {
    const url = urlcat('https://rss3.domains/name/:id', { id })
    const rsp = await fetchJSON<NameInfo>(url)
    return rsp.address
}

export async function getRss3Profile(address: string) {
    const url = urlcat('https://hub.pass3.me/:address', { address })
    const rsp = await fetchJSON<RSS3Info>(url)
    return rsp?.profile
}
