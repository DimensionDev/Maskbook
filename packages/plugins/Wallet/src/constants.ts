import { PluginId } from '@masknet/plugin-infra'

// #region plugin definitions
export const PLUGIN_ID = PluginId.Wallet
export const PLUGIN_NAME = 'Wallet'
export const PLUGIN_DESCRIPTION = 'Mask Wallet'
// #endregion

export const MAX_DERIVE_COUNT = 99

export const UPDATE_CHAIN_STATE_DELAY = 30 /* seconds */ * 1000 /* milliseconds */
