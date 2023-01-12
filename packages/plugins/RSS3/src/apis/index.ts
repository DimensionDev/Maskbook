import urlcat from 'urlcat'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import { AssetType, GeneralAsset, RSS3Profile } from '../types.js'

interface Response {
    status: boolean
    assets: GeneralAsset[]
}

interface RSS3Info {
    profile: RSS3Profile
}

export function getDonations(address: string) {
    return fetchJSON<Response>(
        urlcat('https://hub.pass3.me/assets/list', {
            personaID: address,
            type: AssetType.GitcoinDonation,
        }),
    )
}

export function getFootprints(address: string): Promise<Response> {
    return fetchJSON<Response>(
        urlcat('https://hub.pass3.me/assets/list', {
            personaID: address,
            type: AssetType.POAP,
        }),
    )
}

export async function getRSS3ProfileByAddress(address: string) {
    if (!address) return
    const response = await fetchJSON<RSS3Info | undefined>(
        urlcat('https://hub.pass3.me/:address', { address: formatEthereumAddress(address) }),
    )
    return response?.profile
}
