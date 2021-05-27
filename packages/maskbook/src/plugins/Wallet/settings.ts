import { createGlobalSettings } from '../../settings/createSettings'
import { i18n } from '../../utils/i18n-next'
import { ChainId, ProviderType, NetworkType } from '../../web3/types'
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
 * The network type of the selected wallet
 */
export const currentSelectedWalletNetworkSettings = createGlobalSettings<NetworkType>(
    `${PLUGIN_IDENTIFIER}+selectedWalletNetwork`,
    NetworkType.Ethereum,
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
export const currentBlockNumberSettings = createGlobalSettings<number>(`${PLUGIN_IDENTIFIER}+blockNumber`, 0, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

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

/**
 * Chain Id of CustomNetwork
 */
export const currentCustomNetworkChainIdSettings = createGlobalSettings<ChainId>(
    `${PLUGIN_IDENTIFIER}+CustomNetworkChainId`,
    ChainId.Mainnet,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)
