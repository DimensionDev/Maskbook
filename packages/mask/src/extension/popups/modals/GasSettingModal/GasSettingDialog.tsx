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
import { NetworkPluginID } from '@masknet/shared-base'
import { Alert, Box, Button, TextField, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { formatCurrency, isGreaterThan, isLessThan } from '@masknet/web3-shared-base'

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
}))

interface GasSettingDialogProps {
    open: boolean
    chainId?: ChainId
    gas: string
    onClose: (config?: GasConfig) => void
}

export const GasSettingDialog = memo<GasSettingDialogProps>(function GasSettingModal({ open, chainId, gas, onClose }) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)
    const { value: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { data: nativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })

    const [gasPrice, setGasPrice] = useState('')
    const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState('')
    const [maxFeePerGas, setMaxFeePerGas] = useState('')

    const estiamteSecond = useMemo(() => {
        if (!gasOptions) return
        const target = isSupport1559 ? maxFeePerGas : gasPrice
        if (isLessThan(target, formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas))) {
            return gasOptions.slow.estimatedSeconds
        } else if (isLessThan(target, formatWeiToGwei(gasOptions.fast.suggestedMaxFeePerGas))) {
            return gasOptions.normal.estimatedSeconds
        }
        return gasOptions.fast.estimatedSeconds
    }, [gasOptions, gasPrice, isSupport1559, maxFeePerGas])

    const totalGas = useMemo(() => {
        return formatGweiToWei(isSupport1559 ? maxFeePerGas : gasPrice)
            .times(gas)
            .toFixed()
    }, [gasPrice, gas, maxFeePerGas])

    const error = useMemo(() => {
        if (!isSupport1559) {
            return gasOptions && isGreaterThan(formatWeiToGwei(gasOptions.slow.suggestedMaxFeePerGas), gasPrice)
                ? t('popups_wallet_gas_price_too_low')
                : null
        } else if (isLessThan(maxFeePerGas, maxPriorityFeePerGas)) {
            return t('poppus_wallet_gas_max_priority_fee_too_low')
        }
        return null
    }, [isSupport1559, gasOptions, gasPrice, maxPriorityFeePerGas, maxFeePerGas])

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
        // Set default vaue
        if (!isSupport1559) {
            setGasPrice(formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas).toFixed(2))
        }
        setMaxPriorityFeePerGas(formatWeiToGwei(gasOptions.normal.suggestedMaxPriorityFeePerGas).toFixed(2))
        setMaxFeePerGas(formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas).toFixed(2))
    }, [open, isSupport1559, gasOptions])

    return (
        <BottomDrawer open={open} title={t('popups_wallet_gas_fee')} onClose={onClose}>
            <Box display="flex" flexDirection="column" rowGap={1.5}>
                <Typography className={classes.preview}>
                    {formatWeiToEther(totalGas).toString()}
                    {nativeToken?.symbol}≈
                    {formatCurrency(formatWeiToEther(totalGas).times(nativeTokenPrice ?? 0), 'USD', {
                        onlyRemainTwoDecimal: true,
                    })}
                </Typography>
                {estiamteSecond ? (
                    <Typography className={classes.seconds}>
                        {t('popups_wallet_gas_price_estimate_second', { seconds: estiamteSecond })}
                    </Typography>
                ) : null}
                {gasOptions?.normal.baseFeePerGas && isSupport1559 && !error ? (
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
                                {t('popups_wallet_gas_fee_settings_gas_limit')}
                            </Typography>
                            <TextField value={gas} disabled fullWidth />
                        </Box>
                        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" columnGap={2}>
                            <Box>
                                <Typography className={classes.title}>
                                    {t('popups_wallet_gas_fee_settings_max_priority_fee')}
                                </Typography>
                                <TextField
                                    error={!!error}
                                    value={maxPriorityFeePerGas}
                                    onChange={(e) => setMaxPriorityFeePerGas(e.target.value)}
                                    InputProps={{
                                        endAdornment: <Typography className={classes.unit}>{t('gwei')}</Typography>,
                                        disableUnderline: true,
                                    }}
                                />
                            </Box>
                            <Box>
                                <Typography className={classes.title}>
                                    {t('popups_wallet_gas_fee_settings_max_fee')}
                                </Typography>
                                <TextField
                                    onChange={(e) => setMaxFeePerGas(e.target.value)}
                                    value={maxFeePerGas}
                                    InputProps={{
                                        endAdornment: <Typography className={classes.unit}>{t('gwei')}</Typography>,
                                        disableUnderline: true,
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
                                onChange={(e) => setGasPrice(e.target.value)}
                                InputProps={{
                                    endAdornment: <Typography className={classes.unit}>{t('gwei')}</Typography>,
                                    disableUnderline: true,
                                }}
                            />
                        </Box>
                        <Box>
                            <Typography className={classes.title}>
                                {t('popups_wallet_gas_fee_settings_gas_limit')}
                            </Typography>
                            <TextField value={gas} disabled />
                        </Box>
                    </Box>
                )}
                {error ? <Alert severity="error">{error}</Alert> : null}
                <Button onClick={handleConfirm}>{t('confirm')}</Button>
            </Box>
        </BottomDrawer>
    )
})
