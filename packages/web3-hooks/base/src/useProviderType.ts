import { useSubscription } from 'use-subscription'
import type { Web3Helper } from '@masknet/web3-helpers'
import { UNDEFINED, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { ProviderType } from '@masknet/web3-shared-evm'

export function useProviderType<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
) {
  return ProviderType.MetaMask
}
