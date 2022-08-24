import urlcat from 'urlcat'
import { ChainId } from '@masknet/web3-shared-solana'
import { NFTSCAN_URL } from '../constants'

export async function fetchFromNFTScanV2<T>(chainId: ChainId, pathname: string, init?: RequestInit) {
    if (chainId !== ChainId.Mainnet) return

    const response = await fetch(urlcat(NFTSCAN_URL, pathname), {
        ...init,
        headers: {
            ...init?.headers,
            'x-app-chainid': 'solana',
        },
        cache: 'no-cache',
    })
    const json = await response.json()
    return json as T
}
