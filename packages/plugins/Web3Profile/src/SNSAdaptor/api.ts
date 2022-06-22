import urlcat from 'urlcat'
import { Response, AssetType, AlchemyResponse_EVM } from './types'

// cspell:disable-next-line
const Alchemy_API_Key = '3TJz6QYDHCj0ZhCdGvc5IC6EtMMMTKG1'

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

export function getNFTs(address: string): Promise<AlchemyResponse_EVM> {
    const url = urlcat(`https://eth-mainnet.alchemyapi.io/v2/${Alchemy_API_Key}/getNFTs/`, {
        owner: address,
    })
    return fetchJSON<AlchemyResponse_EVM>(url)
}
