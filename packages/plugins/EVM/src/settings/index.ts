import type { Plugin } from '@masknet/plugin-infra'
import { createInMemorySettings } from '@masknet/shared-base'
import type { EVM_Web3State } from '../state/Protocol/types'

export const Web3StateSettings = createInMemorySettings<EVM_Web3State>(null!)
export const SharedContextSettings = createInMemorySettings<Plugin.Shared.SharedContext>(null!)
