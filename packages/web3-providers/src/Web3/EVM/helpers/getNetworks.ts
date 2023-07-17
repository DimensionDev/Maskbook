import { omit, memoize } from 'lodash-es'
import { getRegisteredWeb3Chains, getRegisteredWeb3Networks } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { type Network, recognizeNetwork, type RecognizableNetwork } from '@masknet/web3-shared-base'
import { Web3StateRef } from '../apis/Web3StateAPI.js'

export const getNetworks = memoize(() => {
    const registeredChains = getRegisteredWeb3Chains(NetworkPluginID.PLUGIN_EVM)
    const registeredNetworks = getRegisteredWeb3Networks(NetworkPluginID.PLUGIN_EVM)
    const customizedNetworks = Web3StateRef.value.Network?.networks?.getCurrentValue() ?? []

    return [
        ...registeredNetworks.map((x) => recognizeNetwork(registeredChains.find((y) => y.chainId === x.chainId)!, x)),
        ...customizedNetworks.map((x) => ({
            ...omit<Network>(x, 'createdAt', 'updatedAt'),
            isRegistered: true,
        })),
    ]
}) as () => RecognizableNetwork[]
