import type { Plugin } from '@masknet/plugin-infra'
import { createMemorySettings } from '@masknet/shared-base'
import type { Web3State } from '../state/Protocol/types'

export const Web3StateSettings = createMemorySettings<Web3State>(null!)
export const SharedContextSettings = createMemorySettings<Plugin.Shared.SharedContext>(null!)
