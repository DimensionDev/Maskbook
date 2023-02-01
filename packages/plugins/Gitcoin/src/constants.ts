import { PluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export const PLUGIN_ID = PluginID.Gitcoin
export const PLUGIN_META_KEY = `${PluginID.Gitcoin}:1`
export const PLUGIN_NAME = 'Gitcoin'
export const PLUGIN_DESCRIPTION = 'Gitcoin grants sustain web3 projects with quadratic funding.'
export const GITCOIN_API_GRANTS_V1 = 'https://gitcoin.co/grants/v1/api/grant/:id/'
export const SUPPORTED_CHAIN_IDS = [ChainId.Mainnet, ChainId.Matic]
