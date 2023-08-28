import { FormattedCurrency } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import {
    useChainIdSupport,
    useFungibleToken,
    useFungibleTokenPrice,
    useGasOptions,
    useNativeTokenAddress,
} from '@masknet/web3-hooks-base'
import {
    GasOptionType,
    ZERO,
    formatBalance,
    formatCurrency,
    isGreaterThan,
    isLessThan,
    isPositive,
    isZero,
    scale10,
    toFixed,
} from '@masknet/web3-shared-base'
import {
    formatGweiToWei,
    formatWeiToEther,
    formatWeiToGwei,
    type ChainId,
    type GasConfig,
} from '@masknet/web3-shared-evm'
import { Alert, Box, Button, TextField, Typography, useTheme } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { BottomDrawer } from '../../components/index.js'
import { ReplaceType, type GasSetting } from '../../pages/Wallet/type.js'
import { useGasRatio } from '../../hook/useGasRatio.js'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
        marginBottom: theme.spacing(1.5),
    },
    unit: {
        fontSize: 14,
        color: theme.palette.maskColor.third,
        lineHeight: '18px',
    },
    seconds: {
        textAlign: 'center',
        fontSize: 14,
        color: theme.palette.maskColor.success,
    },
    preview: {
        textAlign: 'center',
        fontWeight: 700,
        fontSize: 18,
    },
    tips: {
        fontSize: 14,
        lineHeight: '18px',
    },
}))

interface GasSettingDialogProps {
    open: boolean
    chainId?: ChainId
    nonce: string | number
    onClose: (config?: GasConfig) => void
    replaceType?: ReplaceType
    config: GasSetting
}

export const GasSettingDialog = memo<GasSettingDialogProps>(function GasSettingModal({
    open,
    chainId,
    onClose,
    replaceType,
    nonce,
    config,
}) {
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()
    const gasRatio = useGasRatio(config.paymentToken)
    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)
    const { data: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM, { chainId })

    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { data: token } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        config.paymentToken ? config.paymentToken : nativeTokenAddress,
        undefined,
        { chainId },
    )

    const { data: tokenPrice } = useFungibleTokenPrice(
        NetworkPluginID.PLUGIN_EVM,
        config.paymentToken ? config.paymentToken : nativeTokenAddress,
    )

    const [gasPrice = config.gasPrice || '', setGasPrice] = useState<string>()
    const [maxPriorityFeePerGas = config.maxPriorityFeePerGas || '', setMaxPriorityFeePerGas] = useState<string>()
    const [maxFeePerGas = config.maxFeePerGas || '', setMaxFeePerGas] = useState<string>()

    const estimateSecond = useMemo(() => {
        if (!gasOptions || replaceType) return
        const target = isSupport1559 ? maxFeePerGas : gasPrice
        if (isLessThan(target, formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas))) {
            return gasOptions.slow.estimatedSeconds
        } else if (isLessThan(target, formatWeiToGwei(gasOptions.fast.suggestedMaxFeePerGas))) {
            return gasOptions.normal.estimatedSeconds
        }
        return gasOptions.fast.estimatedSeconds
    }, [gasOptions, gasPrice, isSupport1559, maxFeePerGas, replaceType])

    const totalGas = useMemo(() => {
        if (!config.gas) return '0'
        const result = formatGweiToWei((isSupport1559 ? maxFeePerGas : gasPrice) || ZERO).times(config.gas || ZERO)

        if (!gasRatio) return toFixed(result)
        return toFixed(result.multipliedBy(gasRatio))
    }, [gasPrice, config.gas, maxFeePerGas, isSupport1559, gasRatio])

    const gasPriceError = useMemo(() => {
        if (isSupport1559) return
        if (isZero(gasPrice)) return t('popups_wallet_gas_price_should_greater_than_zero')
        if (gasOptions && isGreaterThan(gasOptions.slow.suggestedMaxFeePerGas, formatGweiToWei(gasPrice))) {
            return t('popups_wallet_gas_price_too_low')
        }
        return
    }, [gasPrice, gasOptions, isSupport1559])

    const maxPriorityFeePerGasError = useMemo(() => {
        if (!isSupport1559) return
        const formattedMaxPriorityFee = formatGweiToWei(maxPriorityFeePerGas)
        if (isZero(maxPriorityFeePerGas)) {
            return t('popups_wallet_priority_fee_is_zero')
        } else if (
            gasOptions &&
            isGreaterThan(
                formattedMaxPriorityFee,
                new BigNumber(gasOptions.fast.suggestedMaxPriorityFeePerGas).multipliedBy(2),
            )
        ) {
            return t('popups_wallet_priority_fee_is_too_high')
        } else if (gasOptions && isLessThan(formattedMaxPriorityFee, gasOptions.slow.suggestedMaxPriorityFeePerGas)) {
            return t('popups_wallet_priority_fee_is_too_low')
        }
        return
    }, [maxPriorityFeePerGas, gasOptions, isSupport1559])

    const maxFeePerGasError = useMemo(() => {
        if (!isSupport1559) return
        const formattedMaxPriorityFee = formatGweiToWei(maxPriorityFeePerGas)
        const formattedMaxFee = formatGweiToWei(maxFeePerGas)
        const miniumMaxFeePerGas = formattedMaxPriorityFee.plus(gasOptions?.fast.baseFeePerGas ?? 0)

        if (formattedMaxPriorityFee.isZero()) return

        if (isGreaterThan(miniumMaxFeePerGas, formattedMaxFee)) {
            return t('popups_wallet_max_fee_is_too_low', {
                minimum: formatWeiToGwei(miniumMaxFeePerGas).toFixed(2, BigNumber.ROUND_UP),
            })
        }
        return
    }, [maxFeePerGas, maxPriorityFeePerGas, gasOptions?.fast, isSupport1559])

    const disabled = useMemo(() => {
        if (isSupport1559) {
            return !maxPriorityFeePerGas || !maxFeePerGas || isZero(maxPriorityFeePerGas) || !!maxFeePerGasError
        } else {
            return !gasPrice || isZero(gasPrice)
        }
    }, [maxPriorityFeePerGas, maxFeePerGas, gasOptions, isSupport1559, maxFeePerGasError, gasPrice])

    const error = gasPriceError || maxPriorityFeePerGasError || maxFeePerGasError

    const title = useMemo(() => {
        switch (replaceType) {
            case ReplaceType.CANCEL:
                return t('cancel')
            case ReplaceType.SPEED_UP:
                return t('speed_up')
            default:
                return t('popups_wallet_gas_fee')
        }
    }, [replaceType])

    const tips = useMemo(() => {
        switch (replaceType) {
            case ReplaceType.CANCEL:
                return t('popups_wallet_cancel_transaction_tips')
            case ReplaceType.SPEED_UP:
                return t('popups_wallet_speed_up_transaction_tips')
            default:
                return
        }
    }, [replaceType])

    const handleConfirm = useCallback(() => {
        onClose(
            isSupport1559
                ? {
                      gasOptionType: GasOptionType.CUSTOM,
                      gas: config.gas,
                      maxFeePerGas: formatGweiToWei(maxFeePerGas).toFixed(),
                      maxPriorityFeePerGas: formatGweiToWei(maxPriorityFeePerGas).toFixed(),
                  }
                : {
                      gasPrice: formatGweiToWei(gasPrice).toFixed(),
                      gas: config.gas,
                      gasOptionType: GasOptionType.CUSTOM,
                  },
        )
    }, [gasPrice, maxFeePerGas, maxPriorityFeePerGas, isSupport1559, onClose, config])

    useEffect(() => {
        if (!open || !gasOptions || config.gasPrice || (config.maxFeePerGas && config.maxPriorityFeePerGas)) return
        // Set default value
        if (!isSupport1559) {
            const result =
                replaceType && config.gasPrice
                    ? formatWeiToGwei(config.gasPrice).plus(5)
                    : formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas)

            setGasPrice(result.toFixed(2))
        } else {
            const maxPriorityFeePerGas =
                replaceType && config.maxPriorityFeePerGas
                    ? formatWeiToGwei(config.maxPriorityFeePerGas).plus(5)
                    : formatWeiToGwei(gasOptions.normal.suggestedMaxPriorityFeePerGas)

            const maxFeePerGas =
                replaceType && config.maxFeePerGas
                    ? formatWeiToGwei(config.maxFeePerGas).plus(5)
                    : formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas)

            setMaxPriorityFeePerGas(maxPriorityFeePerGas.toFixed(2))
            setMaxFeePerGas(maxFeePerGas.toFixed(2))
        }
    }, [open, isSupport1559, gasOptions, replaceType, config])

    return (
        <BottomDrawer open={open} title={title} onClose={onClose}>
            <Box display="flex" flexDirection="column" rowGap={1.5} mt={1.5}>
                <Typography className={classes.preview}>
                    {formatBalance(totalGas, token?.decimals, 4, false, true, 6)} {token?.symbol} ≈{' '}
                    <FormattedCurrency
                        value={formatWeiToEther(totalGas).times(tokenPrice ?? 0)}
                        formatter={formatCurrency}
                        options={{
                            onlyRemainTwoOrZeroDecimal: false,
                            customDecimalConfig: {
                                boundary: scale10(1, -4),
                                decimalExp: 4,
                            },
                        }}
                    />
                </Typography>
                {tips ? (
                    <Typography
                        className={classes.tips}
                        sx={{
                            color:
                                replaceType === ReplaceType.CANCEL
                                    ? theme.palette.maskColor.danger
                                    : theme.palette.maskColor.warn,
                        }}>
                        {tips}
                    </Typography>
                ) : null}
                {estimateSecond && !replaceType ? (
                    <Typography className={classes.seconds}>
                        {t('popups_wallet_gas_price_estimate_second', { seconds: estimateSecond })}
                    </Typography>
                ) : null}
                {gasOptions?.normal.baseFeePerGas && isSupport1559 && (!error || !replaceType) ? (
                    <Alert severity="info">
                        {t('popups_wallet_gas_price_current_base_fee', {
                            baseFee: formatWeiToGwei(gasOptions.normal.baseFeePerGas).toFixed(2, BigNumber.ROUND_UP),
                        })}
                    </Alert>
                ) : null}
                {isSupport1559 ? (
                    <>
                        <Box>
                            <Typography className={classes.title}>
                                {replaceType ? t('nonce') : t('popups_wallet_gas_fee_settings_gas_limit')}
                            </Typography>
                            <TextField
                                value={toFixed(replaceType ? nonce : config.gas, 0)}
                                disabled
                                fullWidth
                                InputProps={{
                                    disableUnderline: true,
                                    type: 'number',
                                }}
                            />
                        </Box>
                        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
                            <Box>
                                <Typography className={classes.title}>
                                    {t('popups_wallet_gas_fee_settings_max_priority_fee')}
                                </Typography>
                                <TextField
                                    error={!!maxPriorityFeePerGasError}
                                    value={maxPriorityFeePerGas}
                                    onChange={(e) => {
                                        if (!e.target.value) {
                                            setMaxPriorityFeePerGas('')
                                            setMaxFeePerGas(
                                                formatWeiToGwei(gasOptions?.slow.baseFeePerGas ?? 0).toFixed(2),
                                            )
                                            return
                                        }

                                        if (
                                            (isLessThan(
                                                e.target.value,
                                                formatWeiToGwei(gasOptions?.slow.suggestedMaxPriorityFeePerGas ?? 0),
                                            ) &&
                                                !!replaceType) ||
                                            !isPositive(e.target.value)
                                        ) {
                                            return
                                        }

                                        setMaxPriorityFeePerGas(e.target.value)
                                        setMaxFeePerGas(
                                            formatWeiToGwei(gasOptions?.slow.baseFeePerGas ?? 0)
                                                .plus(e.target.value)
                                                .toFixed(2, BigNumber.ROUND_UP),
                                        )
                                    }}
                                    InputProps={{
                                        endAdornment: <Typography className={classes.unit}>{t('gwei')}</Typography>,
                                        disableUnderline: true,
                                        inputProps: {
                                            min: 0,
                                            type: 'number',
                                        },
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography className={classes.title}>
                                    {t('popups_wallet_gas_fee_settings_max_fee')}
                                </Typography>
                                <TextField
                                    error={!!maxFeePerGasError}
                                    onChange={(e) => {
                                        if (!e.target.value) {
                                            setMaxFeePerGas('')
                                            return
                                        }
                                        if (
                                            (isLessThan(
                                                e.target.value,
                                                formatWeiToGwei(gasOptions?.slow.baseFeePerGas ?? 0).plus(
                                                    maxPriorityFeePerGas,
                                                ),
                                            ) &&
                                                !!replaceType) ||
                                            !isPositive(e.target.value)
                                        )
                                            return

                                        setMaxFeePerGas(e.target.value || '0')
                                    }}
                                    value={maxFeePerGas}
                                    InputProps={{
                                        endAdornment: <Typography className={classes.unit}>{t('gwei')}</Typography>,
                                        disableUnderline: true,
                                        type: 'number',
                                        inputProps: {
                                            min: 0,
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
                        <Box>
                            <Typography className={classes.title}>{t('popups_wallet_gas_price')}</Typography>
                            <TextField
                                error={!!gasPriceError}
                                value={gasPrice}
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        setGasPrice('')
                                        return
                                    }
                                    if (
                                        (isLessThan(
                                            e.target.value,
                                            formatWeiToGwei(gasOptions?.slow.suggestedMaxFeePerGas ?? 0),
                                        ) &&
                                            !!replaceType) ||
                                        !isPositive(e.target.value)
                                    ) {
                                        return
                                    }
                                    setGasPrice(e.target.value || '0')
                                }}
                                InputProps={{
                                    endAdornment: <Typography className={classes.unit}>{t('gwei')}</Typography>,
                                    disableUnderline: true,
                                    type: 'number',
                                    inputProps: {
                                        min: 0,
                                    },
                                }}
                            />
                        </Box>
                        <Box>
                            <Typography className={classes.title}>
                                {replaceType ? t('nonce') : t('popups_wallet_gas_fee_settings_gas_limit')}
                            </Typography>
                            <TextField
                                value={toFixed(replaceType ? nonce : config.gas, 0)}
                                disabled
                                fullWidth
                                InputProps={{
                                    disableUnderline: true,
                                    type: 'number',
                                }}
                            />
                        </Box>
                    </Box>
                )}
                {error ? <Alert severity="error">{error}</Alert> : null}
                <Button onClick={handleConfirm} disabled={disabled}>
                    {t('confirm')}
                </Button>
            </Box>
        </BottomDrawer>
    )
})
