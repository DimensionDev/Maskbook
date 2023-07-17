import { omit, memoize } from 'lodash-es'
import { getRegisteredWeb3Chains, getRegisteredWeb3Networks } from '@masknet/plugin-infra'
import type { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import { type Network } from '@masknet/web3-shared-base'
import { Web3StateRef } from '../apis/Web3StateAPI.js'

export const getNetworks = memoize(() => {
    const registeredChains = getRegisteredWeb3Chains(NetworkPluginID.PLUGIN_EVM)
    const registeredNetworks = getRegisteredWeb3Networks(NetworkPluginID.PLUGIN_EVM)
    const customizedNetworks = Web3StateRef.value.Network?.networks?.getCurrentValue() ?? []

    return [
        ...registeredNetworks.map((x) => registeredChains.find((y) => y.chainId === x.chainId)!),
        ...customizedNetworks.map((x) => ({
            ...omit(x, 'createdAt', 'updatedAt'),
            isCustomized: true,
        })),
    ]
}) as () => Array<Network<ChainId, SchemaType, NetworkType>>
