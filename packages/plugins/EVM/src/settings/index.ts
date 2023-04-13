import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady } from '@masknet/shared-base'
import type { Web3State } from '@masknet/web3-shared-evm'

export const Web3StateSettings = new ValueRefWithReady<Web3State>()
export const SharedContextSettings = new ValueRefWithReady<Plugin.Shared.SharedUIContext>()
