import { zodResolver } from '@hookform/resolvers/zod'
import { formatGweiToEther, useChainId, useNativeTokenDetailed } from '@masknet/web3-shared'
import { Typography } from '@material-ui/core'
import { LoadingButton } from '@material-ui/lab'
import BigNumber from 'bignumber.js'
import { isEmpty } from 'lodash-es'
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAsync, useUpdateEffect } from 'react-use'
import { z as zod } from 'zod'
import { StyledInput } from '../../../../extension/popups/components/StyledInput'
import { useI18N } from '../../../../utils'
import { WalletRPC } from '../../../Wallet/messages'
import { useNativeTokenPrice } from '../../hooks/useTokenPrice'
import type { GasSettingProps } from './types'
import { useGasSettingStyles } from './useGasSettingStyles'

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export const GasSetting1559: FC<GasSettingProps> = memo(({ gasLimit = 0, onConfirm }) => {
    const { classes } = useGasSettingStyles()
    const { t } = useI18N()
    const chainId = useChainId()
    const [selected, setOption] = useState<number | null>(null)
    const { value: nativeToken } = useNativeTokenDetailed()
    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)

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
    const minGasLimit = gasLimit

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
        watch,
        formState: { errors },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            gasLimit: new BigNumber(gasLimit ?? 0).toString(),
            maxPriorityFeePerGas: '',
            maxFeePerGas: '0',
        },
        context: {
            minGasLimit,
            gasNow,
        },
    })

    //#region Set gas on tx to form data
    useUpdateEffect(() => {
        if (gasLimit) setValue('gasLimit', new BigNumber(gasLimit).toString())
    }, [gasLimit, setValue])
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
    //
    const gasPrice = 0

    const handleConfirm = useCallback(
        (data: zod.infer<typeof schema>) => {
            onConfirm?.({
                gasLimit,
                gasPrice,
            })
        },
        [onConfirm, gasLimit, gasPrice],
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
