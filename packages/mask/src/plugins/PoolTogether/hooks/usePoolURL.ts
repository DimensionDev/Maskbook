import { useChainId } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { APP_URL, COMMUNITY_URL } from '../constants.js'
import type { Pool } from '../types.js'

export function usePoolURL(pool: Pool) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const chainName = (ChainId[chainId] as keyof typeof ChainId).toLowerCase()

    return pool.isCommunityPool
        ? new URL(`/pools/${chainName}/${pool.address}`, COMMUNITY_URL).toString()
        : new URL(`/pools/${chainName}/${pool.symbol}`, APP_URL).toString()
}

export function useManagePoolURL(pool: Pool) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const chainName = (ChainId[chainId] as keyof typeof ChainId).toLowerCase()

    return pool.isCommunityPool
        ? new URL(`/pools/${chainName}/${pool.address}/home`, COMMUNITY_URL).toString()
        : new URL(`/account/pools/${chainName}/${pool.symbol}/manage-tickets`, APP_URL).toString()
}
