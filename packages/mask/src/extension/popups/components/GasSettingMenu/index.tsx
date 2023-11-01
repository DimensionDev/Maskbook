import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { noop } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { Box } from '@mui/system'
import { Typography, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'
import { FormattedBalance, FormattedCurrency, useGasCurrencyMenu } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useChainIdSupport,
    useFungibleToken,
    useFungibleTokenPrice,
    useGasOptions,
    useNativeTokenAddress,
} from '@masknet/web3-hooks-base'
import { GasOptionType, ZERO, formatBalance, formatCurrency, scale10, toFixed } from '@masknet/web3-shared-base'
import { type EIP1559GasConfig, type GasConfig, type ChainId, formatWeiToEther } from '@masknet/web3-shared-evm'
import { useMaskSharedTrans } from '../../../../../shared-ui/index.js'
import { useGasOptionsMenu } from '../../hooks/index.js'
import { useGasRatio } from '../../hooks/useGasRatio.js'

interface GasSettingMenuProps {
    minimumGas: string
    initConfig?: GasConfig
    defaultChainId?: ChainId
    disable?: boolean
    onChange?: (config: GasConfig) => void
    onPaymentTokenChange?: (paymentToken: string) => void
    /** Payment token address */
    paymentToken?: string
    owner?: string
    allowMaskAsGas?: boolean
}

export const GasSettingMenu = memo<GasSettingMenuProps>(function GasSettingMenu({
    minimumGas,
    defaultChainId,
    initConfig,
    paymentToken,
    disable,
    allowMaskAsGas,
    owner,
    onChange,
    onPaymentTokenChange,
}) {
    const t = useMaskSharedTrans()
    const theme = useTheme()
    const gasRatio = useGasRatio(paymentToken)
    const [gasConfig = initConfig, setGasConfig] = useState<GasConfig | undefined>()
    const [gasOptionType, setGasOptionType] = useState<GasOptionType | undefined>(
        initConfig?.gasOptionType ?? GasOptionType.SLOW,
    )

    const handleChange = useCallback(
        (config: GasConfig, type?: GasOptionType) => {
            setGasOptionType(type)
            setGasConfig(config)
            onChange?.(config)
        },
        [onChange],
    )

    const [menu, openMenu] = useGasOptionsMenu(minimumGas, !disable ? handleChange : noop, paymentToken)

    const [paymentTokenMenu, openPaymentTokenMenu] = useGasCurrencyMenu(
        NetworkPluginID.PLUGIN_EVM,
        onPaymentTokenChange ?? noop,
        paymentToken,
    )

    const { data: gasOptions } = useGasOptions()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: defaultChainId })
    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)

    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { data: token } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        paymentToken ? paymentToken : nativeTokenAddress,
        undefined,
        { chainId },
    )

    const { data: tokenPrice } = useFungibleTokenPrice(
        NetworkPluginID.PLUGIN_EVM,
        paymentToken ? paymentToken : nativeTokenAddress,
    )

    const gasOptionName = useMemo(() => {
        switch (gasOptionType) {
            case GasOptionType.FAST:
                return t.popups_wallet_gas_fee_settings_instant()
            case GasOptionType.NORMAL:
                return t.popups_wallet_gas_fee_settings_high()
            case GasOptionType.SLOW:
                return t.popups_wallet_gas_fee_settings_medium()
            default:
                return t.popups_wallet_gas_fee_settings_custom()
        }
    }, [gasOptionType])

    const totalGas = useMemo(() => {
        if (!gasConfig) return ZERO
        const result = new BigNumber(
            (isSupport1559 ? (gasConfig as EIP1559GasConfig).maxFeePerGas : gasConfig.gasPrice) || ZERO,
        ).times(minimumGas)

        if (!gasRatio) return toFixed(result, 0)
        return toFixed(result.multipliedBy(gasRatio), 0)
    }, [gasConfig, minimumGas, gasRatio])

    // If there is no init configuration, set a default config
    useEffect(() => {
        if (!!initConfig || !gasOptions || !onChange) return
        const target = gasOptions[GasOptionType.SLOW]
        const result = isSupport1559
            ? {
                  gasOptionType: GasOptionType.SLOW,
                  maxPriorityFeePerGas: target.suggestedMaxPriorityFeePerGas,
                  maxFeePerGas: target.suggestedMaxFeePerGas,
                  gas: minimumGas,
              }
            : {
                  gasOptionType: GasOptionType.SLOW,
                  gasPrice: target.suggestedMaxFeePerGas,
                  gas: minimumGas,
              }

        setGasConfig((prev) => {
            if (prev) return
            return result
        })

        onChange(result)
    }, [onChange, initConfig, gasOptions, isSupport1559, minimumGas])

    return (
        <Box display="flex" alignItems="center">
            <Typography fontWeight={700} fontSize={14} mr={0.5}>
                <FormattedBalance
                    value={totalGas}
                    decimals={token?.decimals}
                    significant={4}
                    symbol={token?.symbol}
                    formatter={formatBalance}
                />
                {' ≈ '}
                <FormattedCurrency
                    value={formatWeiToEther(totalGas).times(tokenPrice ?? 0)}
                    options={{
                        onlyRemainTwoOrZeroDecimal: false,
                        customDecimalConfig: {
                            boundary: scale10(1, -4),
                            decimalExp: 4,
                        },
                    }}
                    formatter={formatCurrency}
                />
            </Typography>
            {!disable ? (
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
            ) : null}
            {owner && allowMaskAsGas ? (
                <>
                    <Icons.ArrowDrop size={20} sx={{ ml: 0.5, cursor: 'pointer' }} onClick={openPaymentTokenMenu} />
                    {paymentTokenMenu}
                </>
            ) : null}
            {menu}
        </Box>
    )
})
