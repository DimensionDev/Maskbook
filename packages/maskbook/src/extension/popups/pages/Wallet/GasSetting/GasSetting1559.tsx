import { makeStyles } from '@masknet/theme'
import { memo, useEffect, useMemo, useState } from 'react'
import { EthereumRpcType, useChainId, useNativeTokenDetailed } from '@masknet/web3-shared'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../../../utils'
import { z as zod } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Typography } from '@material-ui/core'
import { StyledInput } from '../../../components/StyledInput'
import { LoadingButton } from '@material-ui/lab'
import { isEmpty, noop } from 'lodash-es'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import { useHistory, useLocation } from 'react-router'
import { useRejectHandler } from '../hooks/useRejectHandler'
import { useNativeTokenPrice } from '../../../../../plugins/Wallet/hooks/useTokenPrice'

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
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        margin: '10px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selected: {
        backgroundColor: '#1C68F3',
        '& > *': {
            color: '#ffffff!important',
        },
    },
    button: {
        marginTop: 10,
        padding: '9px 10px',
        borderRadius: 20,
    },
    unit: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        flex: 1,
    },
    price: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#15181B',
    },
}))

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export const GasSetting1559 = memo(() => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const chainId = useChainId()
    const location = useLocation()
    const history = useHistory()
    const [selected, setOption] = useState<number | null>(null)
    const { value: nativeToken } = useNativeTokenDetailed()
    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)

    const { value: gasNow } = useAsync(async () => {
        const response = await WalletRPC.getEstimateGasFees(chainId)
        return {
            slow: response?.low,
            standard: response?.medium,
            fast: response?.high,
        }
    }, [chainId])

    const { value } = useUnconfirmedRequest()

    const options = useMemo(
        () => [
            {
                title: t('popups_wallet_gas_fee_settings_low'),
                content: gasNow?.slow,
            },
            {
                title: t('popups_wallet_gas_fee_settings_medium'),
                content: gasNow?.standard,
            },
            {
                title: t('popups_wallet_gas_fee_settings_high'),
                content: gasNow?.fast,
            },
        ],
        [gasNow],
    )

    const gas = useMemo(() => {
        if (
            value &&
            (value?.computedPayload?.type === EthereumRpcType.SEND_ETHER ||
                value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION)
        ) {
            return new BigNumber(value?.computedPayload?._tx.gas ?? 0, 16).toNumber()
        }
        return '0'
    }, [value])

    //#region Form field define schema
    const schema = useMemo(() => {
        return zod
            .object({
                gasLimit: zod
                    .string()
                    .min(1, t('wallet_transfer_error_gasLimit_absence'))
                    .refine(
                        (gasLimit) => new BigNumber(gasLimit).isGreaterThanOrEqualTo(gas),
                        `Gas limit must be at least ${gas}.`,
                    ),
                maxPriorityFeePerGas: zod
                    .string()
                    .min(1, t('wallet_transfer_error_maxPriority_fee_absence'))
                    .refine(
                        (value) => new BigNumber(value).isPositive(),
                        t('wallet_transfer_error_max_priority_gas_fee_positive'),
                    ),
                maxFeePerGas: zod.string().min(1, t('wallet_transfer_error_maxFee_absence')),
            })
            .refine((data) => new BigNumber(data.maxPriorityFeePerGas).isLessThanOrEqualTo(data.maxFeePerGas), {
                message: t('wallet_transfer_error_max_priority_gas_fee_imbalance'),
                path: ['maxFeePerGas'],
            })
    }, [gas, gasNow])
    //#endregion

    const {
        control,
        handleSubmit,
        setValue,
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
            gas,
            gasNow,
        },
    })

    useUpdateEffect(() => {
        if (
            value?.computedPayload?.type === EthereumRpcType.SEND_ETHER ||
            value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION
        ) {
            // if rpc payload contain max fee and max priority fee, set them to default values
            if (value?.computedPayload._tx.maxFeePerGas && value?.computedPayload._tx.maxPriorityFeePerGas) {
                setValue(
                    'maxPriorityFeePerGas',
                    new BigNumber(value.computedPayload._tx.maxPriorityFeePerGas).toString(),
                )
                setValue('maxFeePerGas', new BigNumber(value.computedPayload._tx.maxFeePerGas).toString())
            } else {
                setOption(1)
            }
        }
    }, [value, setValue])

    useUpdateEffect(() => {
        if (gas) setValue('gasLimit', new BigNumber(gas).toString())
    }, [gas, setValue])

    useEffect(() => {
        if (selected !== null) {
            setValue(
                'maxPriorityFeePerGas',
                new BigNumber(options[selected].content?.suggestedMaxPriorityFeePerGas ?? 0).toString() ?? '',
            )
            setValue(
                'maxFeePerGas',
                new BigNumber(options[selected].content?.suggestedMaxFeePerGas ?? 0).toString() ?? '',
            )
        }
    }, [selected, setValue, options])

    const [{ loading }, handleConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            if (value) {
                const config = {
                    ...value.payload.params[0],
                    gas: new BigNumber(data.gasLimit).toString(16),
                    maxPriorityFeePerGas: new BigNumber(data.maxPriorityFeePerGas).toString(),
                    maxFeePerGas: new BigNumber(data.maxFeePerGas).toString(),
                }

                await WalletRPC.updateUnconfirmedRequest({
                    ...value.payload,
                    params: [config, ...value.payload.params],
                })
                history.goBack()
            }
        },
        [value],
    )

    const onSubmit = handleSubmit((data) => handleConfirm(data))

    useRejectHandler(noop, value)

    const [maxPriorityFeePerGas, maxFeePerGas] = watch(['maxPriorityFeePerGas', 'maxFeePerGas'])

    const maxPriorFeeHelperText = useMemo(() => {
        if (new BigNumber(maxPriorityFeePerGas).isLessThan(gasNow?.slow?.suggestedMaxPriorityFeePerGas ?? 0))
            return t('wallet_transfer_error_max_priority_gas_fee_too_low')
        if (
            new BigNumber(maxPriorityFeePerGas).isGreaterThan(
                new BigNumber(gasNow?.fast?.suggestedMaxPriorityFeePerGas ?? 0).multipliedBy(
                    HIGH_FEE_WARNING_MULTIPLIER,
                ),
            )
        )
            return t('wallet_transfer_error_max_priority_gas_fee_too_high')
        return undefined
    }, [maxPriorityFeePerGas, gasNow])

    const maxFeeGasHelperText = useMemo(() => {
        if (new BigNumber(maxFeePerGas).isLessThan(gasNow?.slow?.suggestedMaxFeePerGas ?? 0))
            return t('wallet_transfer_error_max_fee_too_low')
        if (
            new BigNumber(maxFeePerGas).isGreaterThan(
                new BigNumber(gasNow?.fast?.suggestedMaxFeePerGas ?? 0).multipliedBy(HIGH_FEE_WARNING_MULTIPLIER),
            )
        )
            return t('wallet_transfer_error_max_fee_too_high')
        return undefined
    }, [maxFeePerGas, gasNow])

    return (
        <>
            <div className={classes.options}>
                {options.map(({ title, content }, index) => (
                    <div
                        key={index}
                        onClick={() => setOption(index)}
                        className={selected === index ? classes.selected : undefined}>
                        <Typography className={classes.optionsTitle}>{title}</Typography>
                        <Typography>{new BigNumber(content?.suggestedMaxFeePerGas ?? 0).toFixed(2)} Gwei</Typography>
                        <Typography className={classes.gasUSD}>
                            {t('popups_wallet_gas_fee_settings_usd', {
                                usd: new BigNumber(content?.suggestedMaxFeePerGas ?? 0)
                                    .div(10 ** 9)
                                    .times(nativeTokenPrice)
                                    .toPrecision(3),
                            })}
                        </Typography>
                    </div>
                ))}
            </div>
            <Typography className={classes.or}>{t('popups_wallet_gas_fee_settings_or')}</Typography>
            <form onSubmit={onSubmit}>
                <Typography className={classes.label}>{t('popups_wallet_gas_fee_settings_gas_limit')}</Typography>
                <Controller
                    control={control}
                    render={({ field }) => {
                        return (
                            <StyledInput
                                {...field}
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
                            usd: new BigNumber(Number(maxPriorityFeePerGas) ?? 0)
                                .div(10 ** 9)
                                .times(nativeTokenPrice)
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
                            usd: new BigNumber(Number(maxFeePerGas) ?? 0)
                                .div(10 ** 9)
                                .times(nativeTokenPrice)
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
                className={classes.button}
                disabled={!isEmpty(errors)}
                onClick={onSubmit}>
                {t('confirm')}
            </LoadingButton>
        </>
    )
})
