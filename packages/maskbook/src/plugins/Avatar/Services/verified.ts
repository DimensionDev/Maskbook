import { isSameAddress } from '@masknet/web3-shared-evm'
import { first } from 'lodash-es'
import { NFT_CONTRACT_JSON_VERIFIED_SERVER } from '../constants'
import type { NFTVerified } from '../types'

const EXPIRED_TIME = 5 * 60 * 1000
const cache = new Map<'verified', [number, Promise<NFTVerified[]>]>()

async function fetchData() {
    const response = await fetch(NFT_CONTRACT_JSON_VERIFIED_SERVER, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
    })
    if (!response.ok) return []
    const json = (await response.json()) as NFTVerified[]
    return json
}

async function _fetch() {
    const c = cache.get('verified')
    let f, json
    if (c) {
        f = c[1]
        if (!f) {
            f = fetchData()
            cache.set('verified', [Date.now(), f])
        }
        if (Date.now() - c[0] >= EXPIRED_TIME) {
            json = await f
            f = fetchData()
            cache.set('verified', [Date.now(), f])
            return json
        }
    } else {
        f = fetchData()
        cache.set('verified', [Date.now(), f])
    }
    json = await f
    return json
}

export async function getNFTContractVerifiedFromJSON(address: string) {
    const db = (await _fetch()).filter((x) => isSameAddress(x.contractAddress, address))
    return first(db) as NFTVerified
}
