import { createGlobalSettings } from '../../settings/createSettings'
import { i18n } from '../../utils/i18n-next'
import {
    ChainId,
    ProviderType,
    PortfolioProvider,
    CollectibleProvider,
    NetworkType,
    GasNow,
} from '@masknet/web3-shared'
import { PLUGIN_IDENTIFIER } from './constants'
import { isEqual } from 'lodash-es'
import { connectGasNow } from './apis/gasnow'
import { trackEtherPrice } from './apis/coingecko'
import { startEffects } from '../../utils/side-effects'

export const currentAccountSettings = createGlobalSettings<string>(`${PLUGIN_IDENTIFIER}+selectedWalletAddress`, '', {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

/**
 * The network type of the selected wallet
 */
export const currentNetworkSettings = createGlobalSettings<NetworkType>(
    `${PLUGIN_IDENTIFIER}+selectedWalletNetwork`,
    NetworkType.Ethereum,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * The provider type of the selected wallet
 */
export const currentProviderSettings = createGlobalSettings<ProviderType>(
    `${PLUGIN_IDENTIFIER}+selectedWalletProvider`,
    ProviderType.Maskbook,
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
    CollectibleProvider.OPENSEA,
    {
        primary: () => i18n.t('plugin_wallet_settings_collectible_data_source_primary'),
        secondary: () => i18n.t('plugin_wallet_settings_collectible_data_source_secondary'),
    },
)

/**
 * Is the current selected wallet has been locked?
 */
export const currentIsMaskWalletLockedSettings = createGlobalSettings<boolean>(
    `${PLUGIN_IDENTIFIER}+isMaskWalletLocked`,
    false,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

/**
 * Chain Id
 */
export const currentChainIdSettings = createGlobalSettings<number>(`${PLUGIN_IDENTIFIER}+chainId`, ChainId.Mainnet, {
    primary: () => i18n.t('settings_choose_eth_network'),
    secondary: () => 'This only affects the built-in wallet.',
})

/**
 * Block number
 */
export const currentBlockNumberSettings = createGlobalSettings<number>(`${PLUGIN_IDENTIFIER}+blockNumber`, 0, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

/**
 * Balance
 */
export const currentBalanceSettings = createGlobalSettings<string>(`${PLUGIN_IDENTIFIER}+balance`, '0', {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

/**
 * Nonce
 */
export const currentNonceSettings = createGlobalSettings<number>(`${PLUGIN_IDENTIFIER}+nonce`, 0, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

/**
 * Gas Price
 */
export const currentGasPriceSettings = createGlobalSettings<number>(
    `${PLUGIN_IDENTIFIER}+gasPrice`,
    0,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
    (a: number, b: number) => isEqual(a, b),
)

/**
 * Gas Now
 */
export const currentGasNowSettings = createGlobalSettings<GasNow | null>(
    `${PLUGIN_IDENTIFIER}+gasNow`,
    null,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
    (a: GasNow | null, b: GasNow | null) => isEqual(a, b),
)

/**
 * Ether Price in USD
 */
export const currentEtherPriceSettings = createGlobalSettings<number>(`${PLUGIN_IDENTIFIER}+etherPriceUSD`, 0, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

const effect = startEffects(import.meta.webpackHot)

effect(() => connectGasNow())
effect(() => trackEtherPrice())
