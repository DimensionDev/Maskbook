import { PluginId } from '@masknet/plugin-infra'

export const PLUGIN_ID = PluginId.Gitcoin
export const PLUGIN_META_KEY = `${PluginId.Gitcoin}:1`
export const PLUGIN_NAME = 'Gitcoin'
export const PLUGIN_ICON = '\u{1F517}'
export const PLUGIN_DESCRIPTION = 'Gitcoin grants sustain web3 projects with quadratic funding.'

// proxy for: https://gitcoin.co/grants/v1/api/grant/
export const GITCOIN_API_GRANTS_V1 = 'https://gitcoin-agent.r2d2.to/grants/v1/api/grant/:id'
