import { memo, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ReplaceType } from '../type'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { formatGweiToEther, formatGweiToWei, formatWeiToGwei } from '@masknet/web3-shared-evm'
import { z as zod } from 'zod'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../../../utils'
import { hexToNumber, toHex } from 'web3-utils'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { StyledInput } from '../../../components/StyledInput'
import { LoadingButton } from '@mui/lab'
import { isEmpty } from 'lodash-unified'
import { useAsync, useAsyncFn } from 'react-use'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../hooks/useWalletContext'
import { isLessThanOrEqualTo, isPositive, multipliedBy, NetworkPluginID } from '@masknet/web3-shared-base'
import {
    useChainId,
    useWeb3State,
    useNativeToken,
    useNativeTokenPrice,
    useChainIdSupport,
    useWeb3Connection,
} from '@masknet/plugin-infra/web3'
import { useTitle } from '../../../hook/useTitle'

const useStyles = makeStyles()({
    container: {
        padding: 16,
    },
    label: {
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        margin: '10px 0',
    },
    unit: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        flex: 1,
        marginLeft: '0.5em',
    },
    button: {
        fontWeight: 600,
        marginTop: 10,
        padding: '9px 10px',
        borderRadius: 20,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
})

const ReplaceTransaction = memo(() => {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { t } = useI18N()
    const location = useLocation()
    const search = new URLSearchParams(location.search)
    const type = search.get('type') as ReplaceType
    const [errorMessage, setErrorMessage] = useState('')
    const { transaction } = useContainer(WalletContext)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { TransactionFormatter } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { value: formatterTransaction } = useAsync(async () => {
        if (!TransactionFormatter?.formatTransaction || !transaction) return

        return TransactionFormatter.formatTransaction(chainId, transaction)
    }, [transaction, TransactionFormatter, chainId])

    const { value: transactionContext } = useAsync(async () => {
        if (!TransactionFormatter?.createContext || !transaction) return
        return TransactionFormatter.createContext(chainId, transaction)
    }, [transaction, TransactionFormatter, chainId])

    const defaultGas = transaction?._tx.gas ?? 0
    const defaultGasPrice = transaction?._tx.gasPrice ?? 0

    const defaultMaxFeePerGas = transaction?._tx.maxFeePerGas ?? 0
    const defaultMaxPriorityFeePerGas = transaction?._tx.maxPriorityFeePerGas ?? 0

    const { value: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const { value: nativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM)
    const is1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, chainId, 'EIP1559')

    const schema = useMemo(() => {
        return zod
            .object({
                gas: zod.string().refine(
                    (gas) => new BigNumber(gas).gte(hexToNumber(toHex(defaultGas)) ?? 0),
                    t('popups_wallet_gas_fee_settings_min_gas_limit_tips', {
                        limit: hexToNumber(toHex(defaultGas)),
                    }),
                ),
                gasPrice: is1559
                    ? zod.string().optional()
                    : zod.string().min(1, t('wallet_transfer_error_gas_price_absence')),
                maxPriorityFeePerGas: is1559
                    ? zod
                          .string()
                          .min(1, t('wallet_transfer_error_max_priority_fee_absence'))
                          .refine(isPositive, t('wallet_transfer_error_max_priority_gas_fee_positive'))
                    : zod.string().optional(),
                maxFeePerGas: is1559
                    ? zod.string().min(1, t('wallet_transfer_error_max_fee_absence'))
                    : zod.string().optional(),
            })
            .refine((data) => isLessThanOrEqualTo(data.maxPriorityFeePerGas ?? 0, data.maxFeePerGas ?? 0), {
                message: t('wallet_transfer_error_max_priority_gas_fee_imbalance'),
                path: ['maxFeePerGas'],
            })
    }, [defaultGas, is1559])

    const {
        control,
        formState: { errors },
        handleSubmit,
        watch,
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onBlur',
        resolver: zodResolver(schema),
        defaultValues: {
            gas: new BigNumber(hexToNumber(toHex(defaultGas))).toString(),
            gasPrice: formatWeiToGwei(new BigNumber(defaultGasPrice as number, 16))
                .plus(1)
                .toString(),
            maxFeePerGas: formatWeiToGwei(new BigNumber(defaultMaxFeePerGas as number, 16))
                .plus(1)
                .toString(),
            maxPriorityFeePerGas: formatWeiToGwei(new BigNumber(defaultMaxPriorityFeePerGas as number, 16)).toString(),
        },
        context: {
            is1559,
        },
    })

    const [gas, gasPrice, maxFeePerGas] = watch(['gas', 'gasPrice', 'maxFeePerGas'])

    const gasPriceEIP1559 = new BigNumber(maxFeePerGas ? maxFeePerGas : 0)
    const gasPricePrior1559 = new BigNumber(gasPrice ? gasPrice : 0)

    const gasFee = multipliedBy(is1559 ? gasPriceEIP1559 : gasPricePrior1559, gas ? gas : 0)
        .integerValue()
        .toFixed()

    const [{ loading }, handleConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            try {
                const config = {
                    ...transaction?._tx,
                    gas: toHex(new BigNumber(data.gas).toString()),
                    ...(is1559
                        ? {
                              maxPriorityFeePerGas: toHex(formatGweiToWei(data.maxPriorityFeePerGas ?? 0).toString()),
                              maxFeePerGas: toHex(formatGweiToWei(data.maxFeePerGas ?? 0).toString()),
                          }
                        : { gasPrice: toHex(formatGweiToWei(data.gasPrice ?? 0).toString()) }),
                }

                if (!transaction || !formatterTransaction) return

                if (type === ReplaceType.CANCEL) {
                    await connection?.cancelTransaction(transaction?.id, config)
                } else {
                    await connection?.requestTransaction(transaction?.id, config)
                }

                navigate(-1)
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes('maxFeePerGas cannot be less thant maxPriorityFeePerGas')) {
                        setErrorMessage(t('wallet_transfer_error_max_fee_too_low'))
                        return
                    }
                    setErrorMessage(error.message)
                }
            }
        },
        [transactionContext, is1559, type, transaction],
    )

    const onSubmit = handleSubmit((data) => handleConfirm(data))

    useTitle(type === ReplaceType.CANCEL ? t('cancel') : t('speed_up'))

    return (
        <>
            <Box component="main" p={2}>
                <Typography fontSize={18} lineHeight="24px" fontWeight={500}>
                    {type === ReplaceType.CANCEL ? t('popups_cancel_transaction') : t('popups_speed_up_transaction')}
                </Typography>
                <Box display="flex" flexDirection="column" alignItems="center" style={{ padding: '14.5px 0' }}>
                    <Typography fontWeight={500} fontSize={24} lineHeight="30px">
                        {formatGweiToEther(gasFee ?? 0).toString()} {nativeToken?.symbol}
                    </Typography>
                    <Typography>
                        {t('popups_wallet_gas_fee_settings_usd', {
                            usd: formatGweiToEther(gasFee)
                                .times(nativeTokenPrice ?? 0)
                                .toPrecision(3),
                        })}
                    </Typography>
                </Box>
                {is1559 ? (
                    <form onSubmit={onSubmit}>
                        <Typography className={classes.label}>
                            {t('popups_wallet_gas_fee_settings_gas_limit')}
                        </Typography>
                        <Controller
                            control={control}
                            render={({ field }) => (
                                <StyledInput
                                    {...field}
                                    error={!!errors.gas?.message}
                                    helperText={errors.gas?.message}
                                    inputProps={{
                                        pattern: '^[0-9]*[.,]?[0-9]*$',
                                    }}
                                />
                            )}
                            name="gas"
                        />
                        <Typography className={classes.label}>
                            {t('popups_wallet_gas_fee_settings_max_priority_fee')}
                            <Typography component="span" className={classes.unit}>
                                ({t('wallet_transfer_gwei')})
                            </Typography>
                        </Typography>
                        <Controller
                            control={control}
                            render={({ field }) => (
                                <StyledInput
                                    {...field}
                                    error={!!errors.maxPriorityFeePerGas?.message}
                                    helperText={errors.maxPriorityFeePerGas?.message}
                                    inputProps={{
                                        pattern: '^[0-9]*[.,]?[0-9]*$',
                                    }}
                                />
                            )}
                            name="maxPriorityFeePerGas"
                        />

                        <Typography className={classes.label}>
                            {t('popups_wallet_gas_fee_settings_max_fee')}
                            <Typography component="span" className={classes.unit}>
                                ({t('wallet_transfer_gwei')})
                            </Typography>
                        </Typography>

                        <Controller
                            control={control}
                            render={({ field }) => (
                                <StyledInput
                                    {...field}
                                    error={!!errors.maxFeePerGas?.message}
                                    helperText={errors.maxFeePerGas?.message}
                                    inputProps={{
                                        pattern: '^[0-9]*[.,]?[0-9]*$',
                                    }}
                                />
                            )}
                            name="maxFeePerGas"
                        />
                    </form>
                ) : (
                    <form style={{ display: 'flex', gap: 10 }} onSubmit={onSubmit}>
                        <Box>
                            <Typography className={classes.label}>
                                {t('popups_wallet_gas_price')}
                                <Typography component="span" className={classes.unit}>
                                    ({t('wallet_transfer_gwei')})
                                </Typography>
                            </Typography>
                            <Controller
                                control={control}
                                name="gasPrice"
                                render={({ field }) => (
                                    <StyledInput
                                        {...field}
                                        error={!!errors.gasPrice?.message}
                                        helperText={errors.gasPrice?.message}
                                        inputProps={{
                                            pattern: '^[0-9]*[.,]?[0-9]*$',
                                        }}
                                    />
                                )}
                            />
                        </Box>
                        <Box>
                            <Typography className={classes.label}>
                                {t('popups_wallet_gas_fee_settings_gas_limit')}
                            </Typography>
                            <Controller
                                control={control}
                                name="gas"
                                render={({ field }) => (
                                    <StyledInput
                                        {...field}
                                        error={!!errors.gas?.message}
                                        helperText={errors.gas?.message}
                                        inputProps={{
                                            pattern: '^[0-9]*[.,]?[0-9]*$',
                                        }}
                                    />
                                )}
                            />
                        </Box>
                    </form>
                )}
                {errorMessage ? (
                    <Typography color="#FF5F5F" fontSize={12} py={0.5}>
                        {errorMessage}
                    </Typography>
                ) : null}
                <LoadingButton
                    loading={loading}
                    variant="contained"
                    fullWidth
                    classes={{ root: classes.button, disabled: classes.disabled }}
                    disabled={!isEmpty(errors)}
                    onClick={onSubmit}>
                    {t('confirm')}
                </LoadingButton>
            </Box>
        </>
    )
})

export default ReplaceTransaction
