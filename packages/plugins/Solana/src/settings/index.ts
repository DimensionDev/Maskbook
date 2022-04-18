import type Web3 from '@solana/web3.js'
import type { Plugin } from '@masknet/plugin-infra'
import type { Web3Plugin } from '@masknet/plugin-infra/src/entry-web3'
import { createMemorySettings } from '@masknet/shared-base'
import type { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'

export type Web3State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    string[],
    {},
    {},
    typeof Web3
>

export const Web3StateSettings = createMemorySettings<Web3State>(null!)
export const SharedContextSettings = createMemorySettings<Plugin.Shared.SharedContext>(null!)
