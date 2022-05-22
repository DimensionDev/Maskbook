import type { Plugin } from '@masknet/plugin-infra'
import { createInMemorySettings } from '@masknet/shared-base'
import type { FlowWeb3State } from '../state/Connection/types'

export const Web3StateSettings = createInMemorySettings<FlowWeb3State>(null!)
export const SharedContextSettings = createInMemorySettings<Plugin.Shared.SharedContext>(null!)
