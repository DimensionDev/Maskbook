import { z as zod } from 'zod'
import { memo, useEffect, useMemo, useState } from 'react'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { makeStyles } from '@masknet/theme'
import { formatGweiToEther, formatGweiToWei } from '@masknet/web3-shared-evm'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../../../utils'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Typography } from '@mui/material'
import { StyledInput } from '../../../components/StyledInput'
import { LoadingButton } from '@mui/lab'
import { isEmpty } from 'lodash-unified'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { toHex, fromWei } from 'web3-utils'
import {
    GasOptionType,
    isGreaterThan,
    isGreaterThanOrEqualTo,
    isLessThan,
    isLessThanOrEqualTo,
    isPositive,
    multipliedBy,
    NetworkPluginID,
    toFixed,
    TransactionDescriptorType,
} from '@masknet/web3-shared-base'
import { useChainId, useGasOptions, useNativeToken, useNativeTokenPrice, useWeb3 } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
    options: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 10,
        cursor: 'pointer',
        width: '100%',
        overflowX: 'scroll',
        '& > *': {
            backgroundColor: '#f7f9fa',
            borderRadius: 8,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        },
    },
    optionsTitle: {
        color: '#7B8192',
        fontSize: 16,
        lineHeight: '22px',
    },
    optionsContent: {
        fontSize: 11,
    },
    gasPrice: {
        fontSize: 12,
        lineHeight: '16px',
    },
    gasUSD: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '14px',
        wordBreak: 'break-all',
    },
    or: {
        display: 'flex',
        justifyContent: 'center',
    },
    label: {
        color: theme.palette.primary.main,
        fontSize: 12,
        lineHeight: '16px',
        margin: '10px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selected: {
        backgroundColor: theme.palette.primary.main,
        '& > *': {
            color: theme.palette.primary.contrastText,
        },
    },
    button: {
        fontWeight: 600,
        marginTop: 10,
        padding: '9px 10px',
        borderRadius: 20,
    },
    unit: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        flex: 1,
        marginLeft: '0.5em',
    },
    price: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#15181B',
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
}))

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export const GasSetting1559 = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const navigate = useNavigate()
    const [selected, setOption] = useState<number | null>(null)
    const [getGasLimitError, setGetGasLimitError] = useState(false)
    const { value: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId: nativeToken?.chainId,
    })

    const { value, loading: getValueLoading } = useUnconfirmedRequest()
    const { value: gasOptions, loading: getGasOptionsLoading } = useGasOptions(NetworkPluginID.PLUGIN_EVM)

    // #region Gas options
    const options = useMemo(
        () => [
            {
                title: t('popups_wallet_gas_fee_settings_low'),
                content: gasOptions?.[GasOptionType.SLOW],
            },
            {
                title: t('popups_wallet_gas_fee_settings_medium'),
                content: gasOptions?.[GasOptionType.NORMAL],
            },
            {
                title: t('popups_wallet_gas_fee_settings_high'),
                content: gasOptions?.[GasOptionType.FAST],
            },
        ],
        [gasOptions],
    )
    // #endregion

    // #region If the payload type be TRANSFER or INTERACTION, get the gas from the payload
    const gas = useMemo(() => {
        if (
            value &&
            (value?.formatterTransaction?.type === TransactionDescriptorType.TRANSFER ||
                value?.formatterTransaction?.type === TransactionDescriptorType.INTERACTION)
        ) {
            return new BigNumber(value?.formatterTransaction?._tx.gas ?? 0).toNumber()
        }
        return 0
    }, [value])
    // #endregion

    // #region If the payload type be TRANSFER or INTERACTION, estimate min gas limit by tx data
    const { value: minGasLimit } = useAsync(async () => {
        if (
            value &&
            (value?.formatterTransaction?.type === TransactionDescriptorType.TRANSFER ||
                value?.formatterTransaction?.type === TransactionDescriptorType.INTERACTION)
        ) {
            try {
                if (!web3) return 0
                return web3.eth.estimateGas({
                    data: value.formatterTransaction._tx.data,
                    from: value.formatterTransaction._tx.from,
                    to: value.formatterTransaction._tx.to,
                    value: value.formatterTransaction._tx.value,
                })
            } catch {
                setGetGasLimitError(true)
                return 0
            }
        }

        return 0
    }, [value, web3])
    // #endregion

    // #region Form field define schema
    const schema = useMemo(() => {
        return zod
            .object({
                gasLimit: zod
                    .string()
                    .min(1, t('wallet_transfer_error_gas_limit_absence'))
                    .refine(
                        (gasLimit) => isGreaterThanOrEqualTo(gasLimit, minGasLimit ?? 0),
                        t('popups_wallet_gas_fee_settings_min_gas_limit_tips', { limit: minGasLimit }),
                    ),
                maxPriorityFeePerGas: zod
                    .string()
                    .min(1, t('wallet_transfer_error_max_priority_fee_absence'))
                    .refine(isPositive, t('wallet_transfer_error_max_priority_gas_fee_positive')),
                maxFeePerGas: zod.string().min(1, t('wallet_transfer_error_max_fee_absence')),
            })
            .refine((data) => isLessThanOrEqualTo(data.maxPriorityFeePerGas, data.maxFeePerGas), {
                message: t('wallet_transfer_error_max_priority_gas_fee_imbalance'),
                path: ['maxFeePerGas'],
            })
    }, [minGasLimit, gasOptions])
    // #endregion

    const {
        control,
        handleSubmit,
        setValue,
        setError,
        watch,
        formState: { errors },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            gasLimit: new BigNumber(gas).toString(),
            maxPriorityFeePerGas: '',
            maxFeePerGas: '0',
        },
        context: {
            minGasLimit,
            gasOptions,
        },
    })

    // #region If the payload type be TRANSFER or INTERACTION and there are maxFeePerGas and maxPriorityFeePerGas parameters on tx, set them to the form data
    useUpdateEffect(() => {
        if (
            value?.formatterTransaction?.type === TransactionDescriptorType.TRANSFER ||
            value?.formatterTransaction?.type === TransactionDescriptorType.INTERACTION
        ) {
            if (value?.formatterTransaction._tx.maxFeePerGas && value?.formatterTransaction._tx.maxPriorityFeePerGas) {
                setValue(
                    'maxPriorityFeePerGas',
                    fromWei(toFixed(value.formatterTransaction._tx.maxPriorityFeePerGas as string), 'gwei'),
                )
                setValue(
                    'maxFeePerGas',
                    fromWei(toFixed(value.formatterTransaction._tx.maxFeePerGas as string), 'gwei'),
                )
            } else {
                setOption(1)
            }
        }
    }, [value, setValue])
    // #endregion

    // #region Set gas on tx to form data
    useUpdateEffect(() => {
        if (gas) setValue('gasLimit', new BigNumber(gas).toString())
    }, [gas, setValue])
    // #endregion

    // #region If the selected changed, set the value on the option to the form data
    useEffect(() => {
        if (selected === null) return
        const { content } = options[selected]
        setValue('maxPriorityFeePerGas', new BigNumber(content?.suggestedMaxPriorityFeePerGas ?? 0).toString() ?? '')
        setValue('maxFeePerGas', new BigNumber(content?.suggestedMaxFeePerGas ?? 0).toString() ?? '')
    }, [selected, setValue, options])
    // #endregion

    const [{ loading }, handleConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            if (!value) return
            const config = value.payload.params!.map((param) => ({
                ...param,
                gas: toHex(new BigNumber(data.gasLimit).toString()),
                maxPriorityFeePerGas: toHex(formatGweiToWei(data.maxPriorityFeePerGas).toFixed(0)),
                maxFeePerGas: toHex(formatGweiToWei(data.maxFeePerGas).toFixed(0)),
            }))

            await WalletRPC.updateUnconfirmedRequest({
                ...value.payload,
                params: config,
            })
            navigate(-1)
        },
        [value, history],
    )

    const onSubmit = handleSubmit((data) => handleConfirm(data))

    const [maxPriorityFeePerGas, maxFeePerGas, gasLimit] = watch(['maxPriorityFeePerGas', 'maxFeePerGas', 'gasLimit'])

    // #region These are additional form rules that need to be prompted for but do not affect the validation of the form
    const maxPriorFeeHelperText = useMemo(() => {
        if (getGasOptionsLoading) return undefined
        if (isLessThan(maxPriorityFeePerGas, gasOptions?.[GasOptionType.SLOW]?.suggestedMaxPriorityFeePerGas ?? 0))
            return t('wallet_transfer_error_max_priority_gas_fee_too_low')
        if (
            isGreaterThan(
                maxPriorityFeePerGas,
                multipliedBy(
                    gasOptions?.[GasOptionType.FAST]?.suggestedMaxPriorityFeePerGas ?? 0,
                    HIGH_FEE_WARNING_MULTIPLIER,
                ),
            )
        )
            return t('wallet_transfer_error_max_priority_gas_fee_too_high')
        return undefined
    }, [maxPriorityFeePerGas, gasOptions, getGasOptionsLoading])

    const maxFeeGasHelperText = useMemo(() => {
        if (getGasOptionsLoading) return undefined
        if (isLessThan(maxFeePerGas, gasOptions?.[GasOptionType.SLOW]?.estimatedBaseFee ?? 0))
            return t('wallet_transfer_error_max_fee_too_low')
        if (
            isGreaterThan(
                maxFeePerGas,
                multipliedBy(gasOptions?.[GasOptionType.FAST]?.suggestedMaxFeePerGas ?? 0, HIGH_FEE_WARNING_MULTIPLIER),
            )
        )
            return t('wallet_transfer_error_max_fee_too_high')
        return undefined
    }, [maxFeePerGas, gasOptions, getGasOptionsLoading])
    // #endregion

    // #region If the payload is consumed it needs to be redirected
    useUpdateEffect(() => {
        if (!value && !getValueLoading) {
            navigate(PopupRoutes.Wallet, { replace: true })
        }
    }, [value, getValueLoading])
    // #endregion

    // #region If the estimate gas be 0, Set error
    useUpdateEffect(() => {
        if (!getGasLimitError) setError('gasLimit', { message: 'Cant not get estimate gas from contract' })
    }, [getGasLimitError])

    return (
        <>
            <div className={classes.options}>
                {options.map(({ title, content }, index) => (
                    <div
                        key={index}
                        onClick={() => setOption(index)}
                        className={selected === index ? classes.selected : undefined}>
                        <Typography className={classes.optionsTitle}>{title}</Typography>
                        <Typography component="div" className={classes.optionsContent}>
                            {toFixed(content?.suggestedMaxFeePerGas, 2)}
                            <Typography variant="inherit" component="span">
                                {t('wallet_transfer_gwei')}
                            </Typography>
                        </Typography>
                        <Typography className={classes.gasUSD}>
                            {t('popups_wallet_gas_fee_settings_usd', {
                                usd: formatGweiToEther(content?.suggestedMaxFeePerGas ?? 0)
                                    .times(nativeTokenPrice)
                                    .times(21000)
                                    .toPrecision(3),
                            })}
                        </Typography>
                    </div>
                ))}
            </div>
            <form onSubmit={onSubmit}>
                <Typography className={classes.label}>{t('popups_wallet_gas_fee_settings_gas_limit')}</Typography>
                <Controller
                    control={control}
                    render={({ field }) => {
                        return (
                            <StyledInput
                                {...field}
                                onChange={(e) => {
                                    setOption(null)
                                    field.onChange(e)
                                }}
                                error={!!errors.gasLimit?.message}
                                helperText={errors.gasLimit?.message}
                                inputProps={{
                                    pattern: '^[0-9]*[.,]?[0-9]*$',
                                }}
                            />
                        )
                    }}
                    name="gasLimit"
                />
                <Typography className={classes.label}>
                    {t('popups_wallet_gas_fee_settings_max_priority_fee')}
                    <Typography component="span" className={classes.unit}>
                        ({t('wallet_transfer_gwei')})
                    </Typography>
                    <Typography component="span" className={classes.price}>
                        {t('popups_wallet_gas_fee_settings_usd', {
                            usd: formatGweiToEther(Number(maxPriorityFeePerGas) ?? 0)
                                .times(nativeTokenPrice)
                                .times(gasLimit)
                                .toPrecision(3),
                        })}
                    </Typography>
                </Typography>
                <Controller
                    control={control}
                    render={({ field }) => (
                        <StyledInput
                            {...field}
                            onChange={(e) => {
                                setOption(null)
                                field.onChange(e)
                            }}
                            error={!!errors.maxPriorityFeePerGas?.message || !!maxPriorFeeHelperText}
                            helperText={errors.maxPriorityFeePerGas?.message || maxPriorFeeHelperText}
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
                    <Typography component="span" className={classes.price}>
                        {t('popups_wallet_gas_fee_settings_usd', {
                            usd: formatGweiToEther(Number(maxFeePerGas) ?? 0)
                                .times(nativeTokenPrice)
                                .times(gasLimit)
                                .toPrecision(3),
                        })}
                    </Typography>
                </Typography>
                <Controller
                    control={control}
                    render={({ field }) => (
                        <StyledInput
                            {...field}
                            onChange={(e) => {
                                setOption(null)
                                field.onChange(e)
                            }}
                            error={!!errors.maxFeePerGas?.message || !!maxFeeGasHelperText}
                            helperText={errors.maxFeePerGas?.message || maxFeeGasHelperText}
                            inputProps={{
                                pattern: '^[0-9]*[.,]?[0-9]*$',
                            }}
                        />
                    )}
                    name="maxFeePerGas"
                />
            </form>
            <LoadingButton
                loading={loading}
                variant="contained"
                fullWidth
                classes={{ root: classes.button, disabled: classes.disabled }}
                disabled={!isEmpty(errors)}
                onClick={onSubmit}>
                {t('confirm')}
            </LoadingButton>
        </>
    )
})
