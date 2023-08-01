import { GasOptionType, ZERO, formatBalance, formatCurrency, toFixed } from '@masknet/web3-shared-base'
import { type EIP1559GasConfig, type GasConfig, formatWeiToEther } from '@masknet/web3-shared-evm'
import { Typography, useTheme } from '@mui/material'
import { Box } from '@mui/system'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useGasOptionsMenu } from '../../hook/useGasOptionsMenu.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Icons } from '@masknet/icons'
import {
    useChainContext,
    useChainIdSupport,
    useFungibleToken,
    useFungibleTokenPrice,
    useGasOptions,
    useNativeTokenAddress,
} from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { DepositPaymaster } from '@masknet/web3-providers'
import { useAsync } from 'react-use'
import { useContainer } from 'unstated-next'
import { PopupContext } from '../../hook/usePopupContext.js'
import { BigNumber } from 'bignumber.js'
import { FormattedBalance } from '@masknet/shared'
interface GasSettingMenuProps {
    gas: string
    initConfig?: GasConfig
    onChange?: (config: GasConfig) => void
    paymentToken?: string
    allowMaskAsGas?: boolean
}

export const GasSettingMenu = memo<GasSettingMenuProps>(function GasSettingMenu({
    gas,
    onChange,
    initConfig,
    paymentToken,
    allowMaskAsGas,
}) {
    const { t } = useI18N()
    const theme = useTheme()
    const { smartPayChainId } = useContainer(PopupContext)
    const [gasConfig, setGasConfig] = useState<GasConfig | undefined>(initConfig)
    const [gasOptionType, setGasOptionType] = useState<GasOptionType | undefined>(GasOptionType.SLOW)

    const handleChange = useCallback(
        (config: GasConfig, type?: GasOptionType) => {
            if (type) setGasOptionType(type)
            setGasConfig(config)
            onChange?.(config)
        },
        [onChange],
    )

    const [menu, openMenu] = useGasOptionsMenu(gas, handleChange)

    const { value: gasOptions } = useGasOptions()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)

    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { data: token } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, paymentToken ?? nativeTokenAddress)
    const { data: tokenPrice } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, paymentToken ?? nativeTokenAddress)

    const gasOptionName = useMemo(() => {
        switch (gasOptionType) {
            case GasOptionType.FAST:
                return t('popups_wallet_gas_fee_settings_instant')
            case GasOptionType.NORMAL:
                return t('popups_wallet_gas_fee_settings_high')
            case GasOptionType.SLOW:
            default:
                return t('popups_wallet_gas_fee_settings_medium')
        }
    }, [gasOptionType])

    const { value: currencyRatio } = useAsync(async () => {
        if (!smartPayChainId) return
        const depositPaymaster = new DepositPaymaster(smartPayChainId)
        const ratio = await depositPaymaster.getRatio()

        return ratio
    }, [smartPayChainId])

    const totalGas = useMemo(() => {
        if (!gasConfig) return ZERO
        const result = new BigNumber(
            (isSupport1559 ? (gasConfig as EIP1559GasConfig).maxFeePerGas : gasConfig.gasPrice) ?? ZERO,
        ).times(gas)

        if (!currencyRatio) return toFixed(result, 0)
        return toFixed(result.multipliedBy(currencyRatio), 0)
    }, [gasConfig, gas, currencyRatio])

    // If there is no init configuration, set a default config
    useEffect(() => {
        if (initConfig || !gasOptions || !onChange) return
        const target = gasOptions[GasOptionType.SLOW]
        const result = isSupport1559
            ? {
                  maxPriorityFeePerGas: target.suggestedMaxPriorityFeePerGas,
                  maxFeePerGas: target.suggestedMaxFeePerGas,
              }
            : {
                  gasPrice: target.suggestedMaxFeePerGas,
              }

        setGasConfig((prev) => {
            if (prev) return
            return result
        })

        onChange(result)
    }, [onChange, initConfig, gasOptions, isSupport1559])

    return (
        <Box display="flex" alignItems="center">
            <Typography fontWeight={700} fontSize={14}>
                <FormattedBalance
                    value={totalGas}
                    decimals={token?.decimals}
                    significant={4}
                    symbol={token?.symbol}
                    formatter={formatBalance}
                />{' '}
                ≈{' '}
                {formatCurrency(formatWeiToEther(totalGas).times(tokenPrice ?? 0), 'USD', {
                    onlyRemainTwoDecimal: true,
                })}
            </Typography>
            <Box
                py={0.5}
                px={1.5}
                border={`1px solid ${theme.palette.maskColor.line}`}
                onClick={openMenu}
                borderRadius={99}
                display="inline-flex"
                alignItems="center"
                columnGap={0.5}>
                <Typography fontWeight={700} lineHeight="18px" fontSize={14}>
                    {gasOptionName}
                </Typography>
                <Icons.Candle size={12} />
            </Box>
            {menu}
        </Box>
    )
})
