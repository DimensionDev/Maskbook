import { PluginId } from '@masknet/plugin-infra'

// #region plugin definitions

// proxy: https://v.cent.co/data/tweet-txn
export const TWEET_BASE_URL = 'https://vcent-agent.r2d2.to/data/tweet-txn?tweetID='
export const VALUABLES_VCENT_URL = 'https://v.cent.co/tweet/'
// #endregion

export const PLUGIN_ID = PluginId.Valuables
export const PLUGIN_META_KEY = `${PluginId.Valuables}:1`
export const PLUGIN_NAME = 'vCent'
export const PLUGIN_ICON = '\u{1F513}'
export const PLUGIN_DESCRIPTION = 'A Plugin for https://v.cent.co/'
