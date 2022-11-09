import type { Plugin } from '@masknet/plugin-infra'
import { createValueRefWithReady } from '@masknet/shared-base'
import type { SolanaWeb3State } from '../state/Connection/types.js'

export const Web3StateSettings = createValueRefWithReady<SolanaWeb3State>(null!)
export const SharedContextSettings = createValueRefWithReady<Plugin.Shared.SharedUIContext>(null!)
