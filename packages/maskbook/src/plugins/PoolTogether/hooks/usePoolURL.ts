import { useChainDetailed } from '@masknet/web3-shared'
import { APP_URL } from '../constants'
import type { Pool } from '../types'

export function usePoolURL(pool: Pool) {
    const chainDetail = useChainDetailed()
    return new URL(`/pools/${chainDetail?.fullName.toLowerCase()}/${pool.symbol}`, APP_URL).toString()
}

export function useManagePoolURL(pool: Pool) {
    const chainDetail = useChainDetailed()
    return new URL(
        `/account/pools/${chainDetail?.fullName.toLowerCase()}/${pool.symbol}/manage-tickets`,
        APP_URL,
    ).toString()
}
