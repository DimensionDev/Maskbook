import { makeStyles } from '@masknet/theme'
import { memo, useEffect, useMemo, useState } from 'react'
import { EthereumRpcType, formatWeiToGwei, useChainId } from '@masknet/web3-shared'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'
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
}))

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export const GasSetting1559 = memo(() => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const chainId = useChainId()
    const [selected, setOption] = useState<number | null>(null)

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
                    )
                    .refine((value) => {
                        return new BigNumber(value).isGreaterThanOrEqualTo(
                            gasNow?.slow?.suggestedMaxPriorityFeePerGas ?? 0,
                        )
                    }, t('wallet_transfer_error_max_priority_gas_fee_too_low'))
                    .refine(
                        (value) =>
                            new BigNumber(value).isLessThan(
                                new BigNumber(gasNow?.fast?.suggestedMaxPriorityFeePerGas ?? 0).multipliedBy(
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        t('wallet_transfer_error_max_priority_gas_fee_too_high'),
                    ),
                maxFeePerGas: zod
                    .string()
                    .min(1, t('wallet_transfer_error_maxFee_absence'))
                    .refine(
                        (value) =>
                            new BigNumber(value).isGreaterThanOrEqualTo(gasNow?.slow?.suggestedMaxFeePerGas ?? 0),
                        t('wallet_transfer_error_max_fee_too_low'),
                    )
                    .refine(
                        (value) =>
                            new BigNumber(value).isLessThan(
                                new BigNumber(gasNow?.fast?.suggestedMaxFeePerGas ?? 0).multipliedBy(
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        t('wallet_transfer_error_max_fee_too_high'),
                    ),
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
                setValue('maxPriorityFeePerGas', value.computedPayload._tx.maxPriorityFeePerGas)
                setValue('maxFeePerGas', value.computedPayload._tx.maxFeePerGas)
            } else {
                setOption(1)
            }
        }
    }, [value, setValue])

    useEffect(() => {
        if (selected) {
            setValue('maxPriorityFeePerGas', options[selected].content?.suggestedMaxPriorityFeePerGas ?? '')
            setValue('maxFeePerGas', options[selected].content?.suggestedMaxFeePerGas ?? '')
        }
    }, [selected, setValue, options])

    const [{ loading }, handleConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            if (value) {
                const config = {
                    ...value.payload.params[0],
                    gas: data.gasLimit,
                    maxPriorityFeePerGas: new BigNumber(data.maxPriorityFeePerGas).toString(16),
                    maxFeePerGas: new BigNumber(data.maxFeePerGas).toString(16),
                }

                await WalletRPC.deleteUnconfirmedRequest(value.payload)
                await Services.Ethereum.request(
                    {
                        ...value.payload,
                        params: [config, ...value.payload.params],
                    },
                    { skipConfirmation: true },
                )
            }
            //    TODO: url search params to control close or history
        },
        [value],
    )

    const onSubmit = handleSubmit((data) => handleConfirm(data))

    return (
        <>
            <div className={classes.options}>
                {options.map(({ title, content }, index) => (
                    <div
                        key={index}
                        onClick={() => setOption(index)}
                        className={selected === index ? classes.selected : undefined}>
                        <Typography className={classes.optionsTitle}>{title}</Typography>
                        <Typography>{formatWeiToGwei(content?.suggestedMaxFeePerGas ?? 0).toString()} Gwei</Typography>
                        {/*<Typography className={classes.gasUSD}>*/}
                        {/*    {t('popups_wallet_gas_fee_settings_usd', {*/}
                        {/*        usd: new BigNumber(gasPrice)*/}
                        {/*            .div(10 ** 18)*/}
                        {/*            .times(etherPrice)*/}
                        {/*            .toPrecision(3),*/}
                        {/*    })}*/}
                        {/*</Typography>*/}
                    </div>
                ))}
            </div>
            <Typography className={classes.or}>{t('popups_wallet_gas_fee_settings_or')}</Typography>
            <form>
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
                <Typography className={classes.label}>{t('popups_wallet_gas_fee_settings_max_fee')}</Typography>
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
