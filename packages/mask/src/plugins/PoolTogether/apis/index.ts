import type { ChainId } from '@masknet/web3-shared-evm'
import { API_URL } from '../constants'
import type { Pool } from '../types'

export async function fetchPools(chainId: ChainId) {
    // See https://github.com/pooltogether/pooltogether-api-monorepo for API documentation
    const url = new URL(`/pools/${chainId}.json`, API_URL)
    const response = await fetch(url.toString(), {})
    const data = (await response.json()) as Pool[] | null
    return data ?? []
}
