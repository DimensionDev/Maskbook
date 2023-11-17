import { useSubscription } from 'use-subscription'
import { UNDEFINED, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3State } from './useWeb3State.js'
import { useDefaultChainId } from './useDefaultChainId.js'
import { ChainId } from '@masknet/web3-shared-evm'

export function useChainId<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.ChainIdScope<S, T>,
) {
  return ChainId.Mainnet
}
