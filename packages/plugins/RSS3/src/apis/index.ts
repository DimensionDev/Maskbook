import urlcat from 'urlcat'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { AssetType, GeneralAsset, RSS3Profile } from '../types.js'

async function fetchJSON<T = unknown>(url: string): Promise<T> {
    const res = await globalThis.fetch(url)
    return res.json()
}

interface Response {
    status: boolean
    assets: GeneralAsset[]
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

export async function getRSS3ProfileByAddress(address: string) {
    if (!address) return
    const url = urlcat('https://hub.pass3.me/:address', { address: formatEthereumAddress(address) })
    const rsp = await fetchJSON<RSS3Info>(url)
    return rsp?.profile
}
