import type { Plugin } from '@masknet/plugin-infra'
import { createValueRefWithReady } from '@masknet/shared-base'
import type { FlowWeb3State } from '../state/Connection/types'

export const Web3StateSettings = createValueRefWithReady<FlowWeb3State>(null!)
export const SharedContextSettings = createValueRefWithReady<Plugin.Shared.SharedContext>(null!)
