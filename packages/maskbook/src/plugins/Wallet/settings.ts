import stringify from 'json-stable-stringify'
import { createGlobalSettings } from '../../settings/createSettings'
import { i18n } from '../../utils/i18n-next'
import { ChainId, ProviderType } from '../../web3/types'
import { PLUGIN_IDENTIFIER } from './constants'
import { CollectibleProvider, PortfolioProvider } from './types'

/**
 * The address of the selected wallet
 */
export const currentSelectedWalletAddressSettings = createGlobalSettings<string>(
    `${PLUGIN_IDENTIFIER}+selectedWalletAddress`,
    '',
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * The provider type of the selected wallet
 */
export const currentSelectedWalletProviderSettings = createGlobalSettings<ProviderType>(
    `${PLUGIN_IDENTIFIER}+selectedWalletProvider`,
    ProviderType.Maskbook,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * Is Metamask Locked
 */
export const currentIsMetamaskLockedSettings = createGlobalSettings<boolean>(
    `${PLUGIN_IDENTIFIER}+isMetamaskLocked`,
    true,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * The default portfolio data provider
 */
export const currentPortfolioDataProviderSettings = createGlobalSettings<PortfolioProvider>(
    `${PLUGIN_IDENTIFIER}+portfolioProvider`,
    PortfolioProvider.DEBANK,
    {
        primary: () => i18n.t('plugin_wallet_settings_portfolio_data_source_primary'),
        secondary: () => i18n.t('plugin_wallet_settings_portfolio_data_source_secondary'),
    },
)

/**
 * The default collectible data provider
 */
export const currentCollectibleDataProviderSettings = createGlobalSettings<CollectibleProvider>(
    `${PLUGIN_IDENTIFIER}+collectibleProvider`,
    CollectibleProvider.OPENSEAN,
    {
        primary: () => i18n.t('plugin_wallet_settings_collectible_data_source_primary'),
        secondary: () => i18n.t('plugin_wallet_settings_collectible_data_source_secondary'),
    },
)

/**
 * The block number state
 */
export const currentBlockNumnberSettings = createGlobalSettings<string>(
    `${PLUGIN_IDENTIFIER}+blockNumberState`,
    stringify([]),
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export interface ChainBlockNumber {
    chainId: ChainId
    blockNumber: number
}

/**
 * Chain Id of Mask Network
 */
export const currentMaskbookChainIdSettings = createGlobalSettings<ChainId>(
    `${PLUGIN_IDENTIFIER}+MaskChainId`,
    ChainId.Mainnet,
    {
        primary: () => i18n.t('settings_choose_eth_network'),
        secondary: () => 'This only affects the built-in wallet.',
    },
)

/**
 * Chain Id of MetaMask
 */
export const currentMetaMaskChainIdSettings = createGlobalSettings<ChainId>(
    `${PLUGIN_IDENTIFIER}+MetaMaskChainID`,
    ChainId.Mainnet,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * Chain Id of WalletConnect
 */
export const currentWalletConnectChainIdSettings = createGlobalSettings<ChainId>(
    `${PLUGIN_IDENTIFIER}+WalletConnectChainId`,
    ChainId.Mainnet,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)
