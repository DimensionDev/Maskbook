import type { Plugin } from '@masknet/plugin-infra'
import { createMemorySettings } from '@masknet/shared-base'
import type { SolanaWeb3State } from '../state/Protocol/types'

export const Web3StateSettings = createMemorySettings<SolanaWeb3State>(null!)
export const SharedContextSettings = createMemorySettings<Plugin.Shared.SharedContext>(null!)
