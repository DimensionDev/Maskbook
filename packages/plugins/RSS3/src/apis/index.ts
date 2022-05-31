import urlcat from 'urlcat'
import { AssetType, DefProperty, GalaxyCredential, GeneralAsset, POAPAction, RSS3Profile } from '../types'

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

interface GalaxyProfile {
    data: {
        addressInfo: {
            id: string
            avatar: string
            username: string
            eligibleCredentials: {
                list: GalaxyCredential[]
            }
        }
    }
}

export function getDonations(address: string) {
    const url = urlcat('https://hub.pass3.me/assets/list', {
        personaID: address,
        type: AssetType.GitcoinDonation,
    })

    return fetchJSON<Response>(url)
}

export function getPOAPActions(address: string) {
    const url = urlcat('https://api.poap.xyz/actions/scan/:id', {
        id: address,
    })
    return fetchJSON<POAPAction[]>(url)
}

export function getDefProperties(address: string) {
    const url = urlcat('https://www.def.network/api/v1/profiles/:id', {
        id: address,
    })
    return fetchJSON<DefProperty[]>(url)
}

export async function getGalaxyCredentials(address: string) {
    const rsp = await fetchJSON<GalaxyProfile>('https://graphigo.prd.galaxy.eco/query', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            operationName: 'userCredentials',
            variables: { address, first: 100, after: '' },
            query: 'query userCredentials($address: String!, $first: Int, $after: String) {\n  addressInfo(address: $address) {\n    id\n    avatar\n    username\n    eligibleCredentials(first: $first, after: $after) {\n      list {\n        id\n        name\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n',
        }),
    })
    return rsp.data.addressInfo.eligibleCredentials.list
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
