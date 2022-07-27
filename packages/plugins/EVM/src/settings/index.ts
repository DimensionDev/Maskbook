import type { Plugin } from '@masknet/plugin-infra'
import { createValueRefWithReady } from '@masknet/shared-base'
import type { EVM_Web3State } from '../state/Connection/types'

export const Web3StateSettings = createValueRefWithReady<EVM_Web3State>(null!)
export const SharedContextSettings = createValueRefWithReady<Plugin.Shared.SharedUIContext>(null!)
