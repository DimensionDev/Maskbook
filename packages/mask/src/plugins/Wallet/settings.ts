import { createGlobalSettings } from '../../settings/createSettings'
import { i18n } from '../../../shared-ui/locales_legacy'
import {
    ChainId,
    NonFungibleAssetProvider,
    CryptoPrice,
    GasOptions,
    NetworkType,
    FungibleAssetProvider,
    ProviderType,
    LockStatus,
    BalanceOfChains,
} from '@masknet/web3-shared-evm'
import { PLUGIN_IDENTIFIER } from './constants'
import { isEqual } from 'lodash-unified'

export const currentMaskWalletAccountSettings = createGlobalSettings<string>(
    `${PLUGIN_IDENTIFIER}+selectedMaskWalletAddress`,
    '',
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export const currentMaskWalletChainIdSettings = createGlobalSettings<number>(
    `${PLUGIN_IDENTIFIER}+maskWalletChainId`,
    ChainId.Mainnet,
    {
        primary: () => i18n.t('settings_choose_eth_network'),
        secondary: () => 'This only affects the built-in wallet.',
    },
)

export const currentMaskWalletBalanceSettings = createGlobalSettings<string>(
    `${PLUGIN_IDENTIFIER}+maskWalletBalance`,
    '0',
    {
        primary: () => i18n.t('settings_choose_eth_network'),
        secondary: () => 'This only affects the built-in wallet.',
    },
)

export const currentMaskWalletNetworkSettings = createGlobalSettings<NetworkType>(
    `${PLUGIN_IDENTIFIER}+selectedMaskWalletNetwork`,
    NetworkType.Ethereum,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export const currentMaskWalletLockStatusSettings = createGlobalSettings<LockStatus>(
    `${PLUGIN_IDENTIFIER}+maskWalletLockStatus`,
    LockStatus.INIT,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export const currentAccountSettings = createGlobalSettings<string>(`${PLUGIN_IDENTIFIER}+selectedWalletAddress`, '', {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

export const currentNetworkSettings = createGlobalSettings<NetworkType>(
    `${PLUGIN_IDENTIFIER}+selectedWalletNetwork`,
    NetworkType.Ethereum,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export const currentProviderSettings = createGlobalSettings<ProviderType>(
    `${PLUGIN_IDENTIFIER}+selectedWalletProvider`,
    ProviderType.MaskWallet,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
)

export const currentFungibleAssetDataProviderSettings = createGlobalSettings<FungibleAssetProvider>(
    `${PLUGIN_IDENTIFIER}+fungibleAssetProvider`,
    FungibleAssetProvider.DEBANK,
    {
        primary: () => i18n.t('plugin_wallet_settings_fungible_asset_data_source_primary'),
        secondary: () => i18n.t('plugin_wallet_settings_fungible_asset_data_source_secondary'),
    },
)

export const currentNonFungibleAssetDataProviderSettings = createGlobalSettings<NonFungibleAssetProvider>(
    `${PLUGIN_IDENTIFIER}+nonFungibleAssetProvider`,
    NonFungibleAssetProvider.OPENSEA,
    {
        primary: () => i18n.t('plugin_wallet_settings_non_fungible_data_source_primary'),
        secondary: () => i18n.t('plugin_wallet_settings_non_fungible_data_source_secondary'),
    },
)

export const currentChainIdSettings = createGlobalSettings<number>(`${PLUGIN_IDENTIFIER}+chainId`, ChainId.Mainnet, {
    primary: () => i18n.t('settings_choose_eth_network'),
    secondary: () => 'This only affects the built-in wallet.',
})

export const currentBlockNumberSettings = createGlobalSettings<number>(`${PLUGIN_IDENTIFIER}+blockNumber`, 0, {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

export const currentBalanceSettings = createGlobalSettings<string>(`${PLUGIN_IDENTIFIER}+balance`, '0', {
    primary: () => 'DO NOT DISPLAY IT IN UI',
})

export const currentGasOptionsSettings = createGlobalSettings<GasOptions | null>(
    `${PLUGIN_IDENTIFIER}+gasOptions`,
    null,
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
    (a: GasOptions | null, b: GasOptions | null) => isEqual(a, b),
)

/**
 * ERC20 Token prices or native token prices
 */
export const currentTokenPricesSettings = createGlobalSettings<CryptoPrice>(
    `${PLUGIN_IDENTIFIER}+tokenPrices`,
    {},
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
    (a, b) => isEqual(a, b),
)

/**
 * ERC20 Token balances
 */
export const currentBalancesSettings = createGlobalSettings<BalanceOfChains>(
    `${PLUGIN_IDENTIFIER}+balances`,
    {},
    {
        primary: () => 'DO NOT DISPLAY IT IN UI',
    },
    (a, b) => isEqual(a, b),
)
