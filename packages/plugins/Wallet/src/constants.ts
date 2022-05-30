import { PluginId } from '@masknet/plugin-infra'

// #region plugin definitions
export const PLUGIN_ID = PluginId.Wallet
export const PLUGIN_NAME = 'Wallet'
export const PLUGIN_DESCRIPTION = 'Mask Wallet'
// #endregion

// Private key at m/purpose'/coin_type'/account'/change
export const HD_PATH_WITHOUT_INDEX_ETHEREUM = "m/44'/60'/0'/0"

export const MAX_DERIVE_COUNT = 99

export const UPDATE_CHAIN_STATE_DELAY = 30 /* seconds */ * 1000 /* milliseconds */
