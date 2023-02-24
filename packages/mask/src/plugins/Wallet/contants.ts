import { PluginID } from '@masknet/shared-base'

// #region plugin definitions
export const PLUGIN_ID = PluginID.WalletRPC
export const PLUGIN_NAME = 'Wallet RPC'
export const PLUGIN_DESCRIPTION = 'Mask Wallet RPC'
// #endregion

export const UPDATE_CHAIN_STATE_DELAY = 30 /* seconds */ * 1000 /* milliseconds */

export const MAX_DERIVE_COUNT = 99
