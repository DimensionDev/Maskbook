import { makeStyles } from '@masknet/theme'
import { memo, useEffect, useMemo, useState } from 'react'
import {
    EthereumRpcType,
    formatGweiToEther,
    formatGweiToWei,
    formatWeiToGwei,
    useChainId,
    useNativeTokenDetailed,
    useWeb3,
} from '@masknet/web3-shared'
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
import { isEmpty } from 'lodash-es'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import { useHistory } from 'react-router-dom'
import { useNativeTokenPrice } from '../../../../../plugins/Wallet/hooks/useTokenPrice'
import { PopupRoutes } from '../../../index'
import { toHex } from 'web3-utils'

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
        marginLeft: '0.5em',
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
    const web3 = useWeb3()
    const { t } = useI18N()
    const chainId = useChainId()
    const history = useHistory()
    const [selected, setOption] = useState<number | null>(null)
    const [getGasLimitError, setGetGasLimitError] = useState(false)
    const { value: nativeToken } = useNativeTokenDetailed()
    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)

    const { value, loading: getValueLoading } = useUnconfirmedRequest()

    //#region Get suggest gas now data from meta swap api
    const { value: gasNow, loading: getGasNowLoading } = useAsync(async () => {
        return WalletRPC.getEstimateGasFees(chainId)
    }, [chainId])
    //#endregion

    //#region Gas now options
    const options = useMemo(
        () => [
            {
                title: t('popups_wallet_gas_fee_settings_low'),
                content: gasNow?.low,
            },
            {
                title: t('popups_wallet_gas_fee_settings_medium'),
                content: gasNow?.medium,
            },
            {
                title: t('popups_wallet_gas_fee_settings_high'),
                content: gasNow?.high,
            },
        ],
        [gasNow],
    )
    //#endregion

    //#region If the payload type be SEND_ETHER or CONTRACT_INTERACTION, get the gas from the payload
    const gas = useMemo(() => {
        if (
            value &&
            (value?.computedPayload?.type === EthereumRpcType.SEND_ETHER ||
                value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION)
        ) {
            return new BigNumber(value?.computedPayload?._tx.gas ?? 0).toNumber()
        }
        return 0
    }, [value])
    //#endregion

    //#region If the payload type be SEND_ETHER or CONTRACT_INTERACTION, estimate min gas limit by tx data
    const { value: minGasLimit } = useAsync(async () => {
        if (
            value &&
            (value?.computedPayload?.type === EthereumRpcType.SEND_ETHER ||
                value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION)
        ) {
            try {
                return web3.eth.estimateGas({
                    data: value.computedPayload._tx.data,
                    from: value.computedPayload._tx.from,
                    to: value.computedPayload._tx.to,
                    value: value.computedPayload._tx.value,
                })
            } catch {
                setGetGasLimitError(true)
                return 0
            }
        }

        return 0
    }, [value, web3])
    //#endregion

    //#region Form field define schema
    const schema = useMemo(() => {
        return zod
            .object({
                gasLimit: zod
                    .string()
                    .min(1, t('wallet_transfer_error_gasLimit_absence'))
                    .refine(
                        (gasLimit) => new BigNumber(gasLimit).isGreaterThanOrEqualTo(minGasLimit ?? 0),
                        t('popups_wallet_gas_fee_settings_min_gas_limit_tips', { limit: minGasLimit }),
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
    }, [minGasLimit, gasNow])
    //#endregion

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
            gasNow,
        },
    })

    //#region If the payload type be SEND_ETHER or CONTRACT_INTERACTION and there are maxFeePerGas and maxPriorityFeePerGas parameters on tx, set them to the form data
    useUpdateEffect(() => {
        if (
            value?.computedPayload?.type === EthereumRpcType.SEND_ETHER ||
            value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION
        ) {
            if (value?.computedPayload._tx.maxFeePerGas && value?.computedPayload._tx.maxPriorityFeePerGas) {
                setValue(
                    'maxPriorityFeePerGas',
                    formatWeiToGwei(new BigNumber(value.computedPayload._tx.maxPriorityFeePerGas, 16)).toString(),
                )
                setValue(
                    'maxFeePerGas',
                    formatWeiToGwei(new BigNumber(value.computedPayload._tx.maxFeePerGas, 16)).toString(),
                )
            } else {
                setOption(1)
            }
        }
    }, [value, setValue])
    //#endregion

    //#region Set gas on tx to form data
    useUpdateEffect(() => {
        if (gas) setValue('gasLimit', new BigNumber(gas).toString())
    }, [gas, setValue])
    //#endregion

    //#region If the selected changed, set the value on the option to the form data
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
    //#endregion

    const [{ loading }, handleConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            if (value) {
                const config = value.payload.params.map((param) => ({
                    ...param,
                    gas: toHex(new BigNumber(data.gasLimit).toString()),
                    maxPriorityFeePerGas: toHex(formatGweiToWei(data.maxPriorityFeePerGas).toString()),
                    maxFeePerGas: toHex(formatGweiToWei(data.maxFeePerGas).toString()),
                }))

                await WalletRPC.updateUnconfirmedRequest({
                    ...value.payload,
                    params: config,
                })
                history.goBack()
            }
        },
        [value],
    )

    const onSubmit = handleSubmit((data) => handleConfirm(data))

    const [maxPriorityFeePerGas, maxFeePerGas] = watch(['maxPriorityFeePerGas', 'maxFeePerGas'])

    //#region These are additional form rules that need to be prompted for but do not affect the validation of the form
    const maxPriorFeeHelperText = useMemo(() => {
        if (getGasNowLoading) return undefined
        if (new BigNumber(maxPriorityFeePerGas).isLessThan(gasNow?.low?.suggestedMaxPriorityFeePerGas ?? 0))
            return t('wallet_transfer_error_max_priority_gas_fee_too_low')
        if (
            new BigNumber(maxPriorityFeePerGas).isGreaterThan(
                new BigNumber(gasNow?.high?.suggestedMaxPriorityFeePerGas ?? 0).multipliedBy(
                    HIGH_FEE_WARNING_MULTIPLIER,
                ),
            )
        )
            return t('wallet_transfer_error_max_priority_gas_fee_too_high')
        return undefined
    }, [maxPriorityFeePerGas, gasNow, getGasNowLoading])

    const maxFeeGasHelperText = useMemo(() => {
        if (getGasNowLoading) return undefined
        if (new BigNumber(maxFeePerGas).isLessThan(gasNow?.estimatedBaseFee ?? 0))
            return t('wallet_transfer_error_max_fee_too_low')
        if (
            new BigNumber(maxFeePerGas).isGreaterThan(
                new BigNumber(gasNow?.high?.suggestedMaxFeePerGas ?? 0).multipliedBy(HIGH_FEE_WARNING_MULTIPLIER),
            )
        )
            return t('wallet_transfer_error_max_fee_too_high')
        return undefined
    }, [maxFeePerGas, gasNow, getGasNowLoading])
    //endregion

    //#region If the payload is consumed it needs to be redirected
    useUpdateEffect(() => {
        if (!value && !getValueLoading) {
            history.replace(PopupRoutes.Wallet)
        }
    }, [value, getValueLoading])
    //#endregion

    //#region If the estimate gas be 0, Set error
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
                        <Typography component="div">
                            {new BigNumber(content?.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                            <Typography variant="inherit">Gwei</Typography>
                        </Typography>
                        <Typography className={classes.gasUSD}>
                            {t('popups_wallet_gas_fee_settings_usd', {
                                usd: formatGweiToEther(content?.suggestedMaxFeePerGas ?? 0)
                                    .times(nativeTokenPrice)
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
