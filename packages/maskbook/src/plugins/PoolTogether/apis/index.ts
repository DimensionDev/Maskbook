import type { ChainId } from '@dimensiondev/web3-shared'
import { API_URL } from '../constants'
import type { Pool } from '../types'

export async function fetchPools(chainId: ChainId) {
    // See https://github.com/pooltogether/pooltogether-api-monorepo for API documention
    const url = new URL(`/pools/${chainId}.json`, API_URL)
    const response = await fetch(url.toString(), {})
    return (await response.json()) as [Pool]
}
