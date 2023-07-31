import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { BottomDrawer } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import {
    formatWeiToGwei,
    type ChainId,
    formatGweiToWei,
    formatWeiToEther,
    type GasConfig,
} from '@masknet/web3-shared-evm'
import { useChainIdSupport, useGasOptions, useNativeToken, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { NUMERIC_INPUT_REGEXP_PATTERN, NetworkPluginID } from '@masknet/shared-base'
import { Alert, Box, Button, TextField, Typography, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { formatCurrency, isGreaterThan, isLessThan } from '@masknet/web3-shared-base'
import { BigNumber } from 'bignumber.js'
import { ReplaceType, type GasSetting } from '../../pages/Wallet/type.js'

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
    nonce: string
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
    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)
    const { value: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { data: nativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })

    const [gasPrice, setGasPrice] = useState(config.gasPrice ? config.gasPrice : '')
    const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState(
        config.maxPriorityFeePerGas ? config.maxPriorityFeePerGas : '',
    )
    const [maxFeePerGas, setMaxFeePerGas] = useState(config.maxFeePerGas ? config.maxFeePerGas : '')

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
        return formatGweiToWei(isSupport1559 ? maxFeePerGas : gasPrice)
            .times(config.gas)
            .toFixed()
    }, [gasPrice, config.gas, maxFeePerGas])

    const error = useMemo(() => {
        if (!replaceType) return null
        if (!isSupport1559) {
            return gasOptions && isGreaterThan(formatWeiToGwei(gasOptions.slow.suggestedMaxFeePerGas), gasPrice)
                ? t('popups_wallet_gas_price_too_low')
                : null
        } else if (isLessThan(maxFeePerGas, maxPriorityFeePerGas)) {
            return t('popups_wallet_gas_max_priority_fee_too_low')
        }
        return null
    }, [isSupport1559, gasOptions, gasPrice, maxPriorityFeePerGas, maxFeePerGas, replaceType])

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
                      maxFeePerGas: formatGweiToWei(maxFeePerGas).toFixed(),
                      maxPriorityFeePerGas: formatGweiToWei(maxPriorityFeePerGas).toFixed(),
                  }
                : { gasPrice: formatGweiToWei(gasPrice).toFixed() },
        )
    }, [gasPrice, maxFeePerGas, maxPriorityFeePerGas, isSupport1559, onClose])

    useEffect(() => {
        if (!open || !gasOptions) return
        // Set default value
        if (!isSupport1559) {
            const result =
                replaceType && config.gasPrice
                    ? formatWeiToGwei(config.gasPrice).plus(5)
                    : formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas)
            setGasPrice(result.toFixed(2))
        }
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
    }, [open, isSupport1559, gasOptions, replaceType, config])

    return (
        <BottomDrawer open={open} title={title} onClose={onClose}>
            <Box display="flex" flexDirection="column" rowGap={1.5} mt={1.5}>
                <Typography className={classes.preview}>
                    {formatWeiToEther(totalGas).toString()}
                    {nativeToken?.symbol}≈
                    {formatCurrency(formatWeiToEther(totalGas).times(nativeTokenPrice ?? 0), 'USD', {
                        onlyRemainTwoDecimal: true,
                    })}
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
                            baseFee: formatWeiToGwei(gasOptions.normal.baseFeePerGas).toFixed(2),
                        })}
                    </Alert>
                ) : null}
                {isSupport1559 ? (
                    <>
                        <Box>
                            <Typography className={classes.title}>
                                {replaceType ? t('nonce') : t('popups_wallet_gas_fee_settings_gas_limit')}
                            </Typography>
                            <TextField value={replaceType ? nonce : config.gas} disabled fullWidth />
                        </Box>
                        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
                            <Box>
                                <Typography className={classes.title}>
                                    {t('popups_wallet_gas_fee_settings_max_priority_fee')}
                                </Typography>
                                <TextField
                                    error={!!error}
                                    value={maxPriorityFeePerGas}
                                    onChange={(e) => {
                                        if (
                                            isLessThan(
                                                e.target.value,
                                                formatWeiToGwei(gasOptions?.slow.suggestedMaxPriorityFeePerGas ?? 0),
                                            ) &&
                                            !!replaceType
                                        )
                                            return
                                        setMaxPriorityFeePerGas(e.target.value)
                                        setMaxFeePerGas((prev) => new BigNumber(e.target.value).plus(prev).toString())
                                    }}
                                    InputProps={{
                                        endAdornment: <Typography className={classes.unit}>{t('gwei')}</Typography>,
                                        disableUnderline: true,
                                        inputProps: {
                                            pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                        },
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography className={classes.title}>
                                    {t('popups_wallet_gas_fee_settings_max_fee')}
                                </Typography>
                                <TextField
                                    onChange={(e) => {
                                        if (
                                            isLessThan(
                                                e.target.value,
                                                formatWeiToGwei(gasOptions?.slow.baseFeePerGas ?? 0).plus(
                                                    maxPriorityFeePerGas,
                                                ),
                                            ) &&
                                            !!replaceType
                                        )
                                            return

                                        setMaxFeePerGas(e.target.value)
                                    }}
                                    value={maxFeePerGas}
                                    InputProps={{
                                        endAdornment: <Typography className={classes.unit}>{t('gwei')}</Typography>,
                                        disableUnderline: true,
                                        inputProps: {
                                            pattern: NUMERIC_INPUT_REGEXP_PATTERN,
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
                                error={!!error}
                                value={gasPrice}
                                onChange={(e) => {
                                    if (
                                        isLessThan(
                                            e.target.value,
                                            formatWeiToGwei(gasOptions?.slow.suggestedMaxFeePerGas ?? 0),
                                        ) &&
                                        !!replaceType
                                    ) {
                                        return
                                    }
                                    setGasPrice(e.target.value)
                                }}
                                InputProps={{
                                    endAdornment: <Typography className={classes.unit}>{t('gwei')}</Typography>,
                                    disableUnderline: true,
                                    inputProps: {
                                        pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                    },
                                }}
                            />
                        </Box>
                        <Box>
                            <Typography className={classes.title}>
                                {t('popups_wallet_gas_fee_settings_gas_limit')}
                            </Typography>
                            <TextField value={config.gas} disabled />
                        </Box>
                    </Box>
                )}
                {error ? <Alert severity="error">{error}</Alert> : null}
                <Button onClick={handleConfirm}>{t('confirm')}</Button>
            </Box>
        </BottomDrawer>
    )
})
