import urlcat from 'urlcat'
import { fetchJSON } from '../../extension/background-script/HelperService'
import type { GeneralAsset, RSS3Profile } from './apis/types'

export * from './apis'

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

export async function getAddressByRss3ProfileLink(profileUrl: string) {
    const matched = profileUrl.match(/^https?:\/\/(\w+)\.rss3\.bio/)
    if (!matched) {
        return ''
    }
    const url = urlcat('https://rss3.domains/name/:id', { id: matched[1] })
    const rsp = (await fetchJSON(url)) as NameInfo
    return rsp.address
}

export async function getRss3Profile(address: string) {
    const url = urlcat('https://hub.pass3.me/:address', { address })
    const rsp = (await fetchJSON(url)) as RSS3Info
    return rsp?.profile
}
