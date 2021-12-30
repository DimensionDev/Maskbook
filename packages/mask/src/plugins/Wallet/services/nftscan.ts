import * as nftscan from '../apis/nftscan'

export async function nftscanFindAssets(address: string) {
    return nftscan.findAssets(address)
}
