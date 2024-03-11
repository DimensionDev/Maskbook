import { FormattedCurrency } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import {
    useChainIdSupport,
    useFungibleToken,
    useFungibleTokenPrice,
    useGasLimitRange,
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
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import { ReplaceType, type GasSetting } from '../../pages/Wallet/type.js'
import { useGasRatio } from '../../hooks/useGasRatio.js'

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
    const t = useMaskSharedTrans()
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

    const [minGas, defaultGas, maxGas] = useGasLimitRange(NetworkPluginID.PLUGIN_EVM, { chainId })
    const [gasLimit = config.gasLimit || defaultGas, setGasLimit] = useState<string | undefined>()
    const [gasPrice = config.gasPrice || '1', setGasPrice] = useState<string | undefined>()
    const [maxPriorityFeePerGas = config.maxPriorityFeePerGas || '1', setMaxPriorityFeePerGas] = useState<
        string | undefined
    >()
    const [maxFeePerGas = config.maxFeePerGas || '1', setMaxFeePerGas] = useState<string | undefined>()

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
        const result = formatGweiToWei((isSupport1559 ? maxFeePerGas : gasPrice) || ZERO).times(
            gasLimit || defaultGas || ZERO,
        )

        if (!gasRatio) return toFixed(result)
        return toFixed(result.multipliedBy(gasRatio))
    }, [gasPrice, gasLimit, maxFeePerGas, isSupport1559, gasRatio])

    const gasLimitError = (() => {
        if (!gasLimit) return
        if (minGas && isLessThan(gasLimit, minGas)) return t.popups_wallet_gas_limit_too_low({ gas: minGas })
        if (maxGas && isGreaterThan(gasLimit, maxGas)) return t.popups_wallet_gas_limit_too_high({ gas: maxGas })
        return
    })()

    const gasPriceError = (() => {
        if (isSupport1559) return
        if (isZero(gasPrice)) return t.popups_wallet_gas_price_should_greater_than_zero()
        if (gasOptions && isGreaterThan(gasOptions.slow.suggestedMaxFeePerGas, formatGweiToWei(gasPrice))) {
            return t.popups_wallet_gas_price_too_low()
        }
        return
    })()

    const maxPriorityFeePerGasError = useMemo(() => {
        if (!isSupport1559) return
        const formattedMaxPriorityFee = formatGweiToWei(maxPriorityFeePerGas)
        if (isZero(maxPriorityFeePerGas)) {
            return t.popups_wallet_priority_fee_is_zero()
        } else if (
            gasOptions &&
            isGreaterThan(
                formattedMaxPriorityFee,
                new BigNumber(gasOptions.fast.suggestedMaxPriorityFeePerGas).multipliedBy(2),
            )
        ) {
            return t.popups_wallet_priority_fee_is_too_high()
        } else if (gasOptions && isLessThan(formattedMaxPriorityFee, gasOptions.slow.suggestedMaxPriorityFeePerGas)) {
            return t.popups_wallet_priority_fee_is_too_low()
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
            return t.popups_wallet_max_fee_is_too_low({
                minimum: formatWeiToGwei(miniumMaxFeePerGas).toFixed(2, BigNumber.ROUND_UP),
            })
        }
        return
    }, [maxFeePerGas, maxPriorityFeePerGas, gasOptions?.fast, isSupport1559])

    const error = gasPriceError || maxPriorityFeePerGasError || maxFeePerGasError || gasLimitError

    const tips = (() => {
        switch (replaceType) {
            case ReplaceType.CANCEL:
                return t.popups_wallet_cancel_transaction_tips()
            case ReplaceType.SPEED_UP:
                return t.popups_wallet_speed_up_transaction_tips()
            default:
                return
        }
    })()

    const handleConfirm = useCallback(() => {
        onClose(
            isSupport1559 ?
                {
                    gasOptionType: GasOptionType.CUSTOM,
                    gas: gasLimit,
                    maxFeePerGas: formatGweiToWei(maxFeePerGas).toFixed(),
                    maxPriorityFeePerGas: formatGweiToWei(maxPriorityFeePerGas).toFixed(),
                }
            :   {
                    gasPrice: formatGweiToWei(gasPrice).toFixed(),
                    gas: gasLimit,
                    gasOptionType: GasOptionType.CUSTOM,
                },
        )
    }, [gasPrice, gasLimit, maxFeePerGas, maxPriorityFeePerGas, isSupport1559, onClose, config])

    useEffect(() => {
        if (!open || !gasOptions || config.gasPrice || (config.maxFeePerGas && config.maxPriorityFeePerGas)) return
        // Set default value
        if (!isSupport1559) {
            const result =
                replaceType && config.gasPrice ?
                    formatWeiToGwei(config.gasPrice).plus(5)
                :   formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas)

            setGasPrice(result.toFixed(2))
        } else {
            const maxPriorityFeePerGas =
                replaceType && config.maxPriorityFeePerGas ?
                    formatWeiToGwei(config.maxPriorityFeePerGas).plus(5)
                :   formatWeiToGwei(gasOptions.normal.suggestedMaxPriorityFeePerGas)

            const maxFeePerGas =
                replaceType && config.maxFeePerGas ?
                    formatWeiToGwei(config.maxFeePerGas).plus(5)
                :   formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas)

            setMaxPriorityFeePerGas(maxPriorityFeePerGas.toFixed(2))
            setMaxFeePerGas(maxFeePerGas.toFixed(2))
        }
    }, [open, isSupport1559, gasOptions, replaceType, config])

    const nonceOrGasLimitInput =
        replaceType ?
            <Box>
                <Typography className={classes.title}>{t.nonce()}</Typography>
                <TextField
                    value={toFixed(nonce, 0)}
                    disabled
                    type="number"
                    fullWidth
                    InputProps={{
                        disableUnderline: true,
                    }}
                />
            </Box>
        :   <Box>
                <Typography className={classes.title}>{t.popups_wallet_gas_fee_settings_gas_limit()}</Typography>
                <TextField
                    value={toFixed(gasLimit, 0)}
                    onChange={(e) => {
                        if (!e.currentTarget.value || !isPositive(e.currentTarget.value)) {
                            setGasLimit(minGas || '0')
                            return
                        }
                        setGasLimit(e.currentTarget.value)
                    }}
                    fullWidth
                    type="number"
                    InputProps={{
                        disableUnderline: true,
                        inputProps: { min: minGas, max: maxGas },
                    }}
                />
            </Box>
    return (
        <Box display="flex" flexDirection="column" rowGap={1.5} mt={1.5}>
            <Typography className={classes.preview}>
                {formatBalance(totalGas, token?.decimals, {
                    significant: 4,
                    isPrecise: false,
                    isFixed: true,
                    fixedDecimals: 6,
                })}{' '}
                {token?.symbol} ≈{' '}
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
            {tips ?
                <Typography
                    className={classes.tips}
                    sx={{
                        color:
                            replaceType === ReplaceType.CANCEL ?
                                theme.palette.maskColor.danger
                            :   theme.palette.maskColor.warn,
                    }}>
                    {tips}
                </Typography>
            :   null}
            {estimateSecond && !replaceType ?
                <Typography className={classes.seconds}>
                    {}
                    {/* @ts-expect-error https://github.com/Jack-Works/i18n-codegen/issues/10 */}
                    {t.popups_wallet_gas_price_estimate_second({ seconds: String(estimateSecond) })}
                </Typography>
            :   null}
            {gasOptions?.normal.baseFeePerGas && isSupport1559 && (!error || !replaceType) ?
                <Alert severity="info">
                    {t.popups_wallet_gas_price_current_base_fee({
                        baseFee: formatWeiToGwei(gasOptions.normal.baseFeePerGas).toFixed(2, BigNumber.ROUND_UP),
                    })}
                </Alert>
            :   null}
            {isSupport1559 ?
                <>
                    {nonceOrGasLimitInput}
                    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
                        <Box>
                            <Typography className={classes.title}>
                                {t.popups_wallet_gas_fee_settings_max_priority_fee()}
                            </Typography>
                            <TextField
                                error={!!maxPriorityFeePerGasError}
                                value={maxPriorityFeePerGas}
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        setMaxPriorityFeePerGas('1')
                                        setMaxFeePerGas(formatWeiToGwei(gasOptions?.slow.baseFeePerGas ?? 0).toFixed(2))
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
                                type="number"
                                InputProps={{
                                    endAdornment: <Typography className={classes.unit}>{t.gwei()}</Typography>,
                                    disableUnderline: true,
                                    inputProps: { min: 1 },
                                }}
                            />
                        </Box>
                        <Box>
                            <Typography className={classes.title}>
                                {t.popups_wallet_gas_fee_settings_max_fee()}
                            </Typography>
                            <TextField
                                error={!!maxFeePerGasError}
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        setMaxFeePerGas('1')
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

                                    setMaxFeePerGas(e.target.value || '1')
                                }}
                                value={maxFeePerGas}
                                type="number"
                                InputProps={{
                                    endAdornment: <Typography className={classes.unit}>{t.gwei()}</Typography>,
                                    disableUnderline: true,
                                    inputProps: { min: 0 },
                                }}
                            />
                        </Box>
                    </Box>
                </>
            :   <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
                    <Box>
                        <Typography className={classes.title}>{t.popups_wallet_gas_price()}</Typography>
                        <TextField
                            error={!!gasPriceError}
                            value={gasPrice}
                            onChange={(e) => {
                                if (!e.target.value) {
                                    setGasPrice('1')
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
                                setGasPrice(e.target.value || '1')
                            }}
                            type="number"
                            InputProps={{
                                endAdornment: <Typography className={classes.unit}>{t.gwei()}</Typography>,
                                disableUnderline: true,
                                inputProps: { min: 0 },
                            }}
                        />
                    </Box>
                    {nonceOrGasLimitInput}
                </Box>
            }
            {error ?
                <Alert severity="error">{error}</Alert>
            :   null}
            <Button onClick={handleConfirm} disabled={Boolean(error)}>
                {t.confirm()}
            </Button>
        </Box>
    )
})
