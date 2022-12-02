import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady } from '@masknet/shared-base'
import type { SolanaWeb3State } from '../state/Connection/types.js'

export const Web3StateSettings = new ValueRefWithReady<SolanaWeb3State>()
export const SharedContextSettings = new ValueRefWithReady<Plugin.Shared.SharedUIContext>()
