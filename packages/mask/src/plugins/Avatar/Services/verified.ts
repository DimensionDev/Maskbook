import { isSameAddress } from '@masknet/web3-shared-evm'
import { first } from 'lodash-unified'
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

    return response.json() as Promise<NFTVerified[]>
}

async function _fetch() {
    let c = cache.get('verified')
    if (!c) {
        const f = fetchData()
        cache.set('verified', [Date.now(), f])
    } else {
        const [t, f] = c
        if (!f || Date.now() - t >= EXPIRED_TIME) {
            const _f = fetchData()
            cache.set('verified', [Date.now(), _f])
        }
    }

    c = cache.get('verified')
    if (!c) return []
    const [_, f] = c

    return f
        .then((data) => data)
        .catch((err) => {
            console.log(err)
            cache.delete('verified')
            return []
        })
}

export async function getNFTContractVerifiedFromJSON(address: string) {
    const db = (await _fetch()).filter((x) => isSameAddress(x.contractAddress, address))
    return first(db) as NFTVerified
}
