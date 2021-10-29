import { zodResolver } from '@hookform/resolvers/zod'
import { formatGweiToEther, useChainId, useNativeTokenDetailed, GasOption } from '@masknet/web3-shared-evm'
import { toWei } from 'web3-utils'
import { Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import BigNumber from 'bignumber.js'
import { isEmpty, noop } from 'lodash-es'
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAsync, useUpdateEffect } from 'react-use'
import { z as zod } from 'zod'
import { StyledInput } from '../../../../extension/popups/components/StyledInput'
import { useI18N } from '../../../../utils'
import { WalletRPC } from '../../../Wallet/messages'
import { useNativeTokenPrice } from '../../hooks/useTokenPrice'
import { useGasSettingStyles } from './useGasSettingStyles'
import type { GasSettingProps } from './types'

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export const GasSetting1559: FC<GasSettingProps> = memo(
    ({ gasLimit, minGasLimit = 0, gasOption = GasOption.Medium, onConfirm = noop }) => {
        const { classes } = useGasSettingStyles()
        const { t } = useI18N()
        const chainId = useChainId()
        const [selectedGasOption, setGasOption] = useState<GasOption | null>(gasOption)
        const { value: nativeToken } = useNativeTokenDetailed()
        const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)

        //#region Get suggest gas options data from meta swap api
        const { value: gasOptions, loading: getGasOptionsLoading } = useAsync(async () => {
            return WalletRPC.getEstimateGasFees(chainId)
        }, [chainId])
        //#endregion

        //#region Gas options
        const options = useMemo(
            () => [
                {
                    title: t('popups_wallet_gas_fee_settings_low'),
                    gasOption: GasOption.Low,
                    content: gasOptions?.low,
                },
                {
                    title: t('popups_wallet_gas_fee_settings_medium'),
                    gasOption: GasOption.Medium,
                    content: gasOptions?.medium,
                },
                {
                    title: t('popups_wallet_gas_fee_settings_high'),
                    gasOption: GasOption.High,
                    content: gasOptions?.high,
                },
            ],
            [gasOptions],
        )
        //#endregion
        const currentGasOption = options.find((opt) => opt.gasOption === selectedGasOption)

        //#region Form field define schema
        const schema = useMemo(() => {
            return zod
                .object({
                    gasLimit: zod
                        .string()
                        .min(1, t('wallet_transfer_error_gas_limit_absence'))
                        .refine(
                            (gasLimit) => new BigNumber(gasLimit).isGreaterThanOrEqualTo(minGasLimit),
                            t('popups_wallet_gas_fee_settings_min_gas_limit_tips', { limit: minGasLimit }),
                        ),
                    maxPriorityFeePerGas: zod
                        .string()
                        .min(1, t('wallet_transfer_error_max_priority_fee_absence'))
                        .refine(
                            (value) => new BigNumber(value).isPositive(),
                            t('wallet_transfer_error_max_priority_gas_fee_positive'),
                        ),
                    maxFeePerGas: zod.string().min(1, t('wallet_transfer_error_max_fee_absence')),
                })
                .refine((data) => new BigNumber(data.maxPriorityFeePerGas).isLessThanOrEqualTo(data.maxFeePerGas), {
                    message: t('wallet_transfer_error_max_priority_gas_fee_imbalance'),
                    path: ['maxFeePerGas'],
                })
        }, [minGasLimit, gasOptions])
        //#endregion

        const {
            control,
            handleSubmit,
            setValue,
            clearErrors,
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
                gasOptions,
            },
        })

        //#region Set gas on tx to form data
        useUpdateEffect(() => {
            if (gasLimit) setValue('gasLimit', new BigNumber(gasLimit).toString())
        }, [gasLimit, setValue])
        //#endregion

        //#region If the selected changed, set the value on the option to the form data
        useEffect(() => {
            if (selectedGasOption !== null) {
                clearErrors(['maxPriorityFeePerGas', 'maxFeePerGas'])
                setValue(
                    'maxPriorityFeePerGas',
                    new BigNumber(currentGasOption?.content?.suggestedMaxPriorityFeePerGas ?? 0).toString() ?? '',
                )
                setValue(
                    'maxFeePerGas',
                    new BigNumber(currentGasOption?.content?.suggestedMaxFeePerGas ?? 0).toString() ?? '',
                )
            }
        }, [currentGasOption, setValue, options])
        //#endregion

        const handleConfirm = useCallback(
            (data: zod.infer<typeof schema>) => {
                onConfirm?.({
                    gasLimit: data.gasLimit,
                    maxFee: toWei(data.maxFeePerGas, 'gwei'),
                    gasOption: selectedGasOption,
                })
            },
            [onConfirm, selectedGasOption],
        )

        const onSubmit = handleSubmit(handleConfirm)

        const [maxPriorityFeePerGas, maxFeePerGas, inputGasLimit] = watch([
            'maxPriorityFeePerGas',
            'maxFeePerGas',
            'gasLimit',
        ])

        //#region These are additional form rules that need to be prompted for but do not affect the validation of the form
        const maxPriorFeeHelperText = useMemo(() => {
            if (getGasOptionsLoading) return undefined
            if (new BigNumber(maxPriorityFeePerGas).isLessThan(gasOptions?.low?.suggestedMaxPriorityFeePerGas ?? 0))
                return t('wallet_transfer_error_max_priority_gas_fee_too_low')
            if (
                new BigNumber(maxPriorityFeePerGas).isGreaterThan(
                    new BigNumber(gasOptions?.high?.suggestedMaxPriorityFeePerGas ?? 0).multipliedBy(
                        HIGH_FEE_WARNING_MULTIPLIER,
                    ),
                )
            )
                return t('wallet_transfer_error_max_priority_gas_fee_too_high')
            return undefined
        }, [maxPriorityFeePerGas, gasOptions, getGasOptionsLoading])

        const maxFeeGasHelperText = useMemo(() => {
            if (getGasOptionsLoading) return undefined
            if (new BigNumber(maxFeePerGas).isLessThan(gasOptions?.estimatedBaseFee ?? 0))
                return t('wallet_transfer_error_max_fee_too_low')
            if (
                new BigNumber(maxFeePerGas).isGreaterThan(
                    new BigNumber(gasOptions?.high?.suggestedMaxFeePerGas ?? 0).multipliedBy(
                        HIGH_FEE_WARNING_MULTIPLIER,
                    ),
                )
            )
                return t('wallet_transfer_error_max_fee_too_high')
            return undefined
        }, [maxFeePerGas, gasOptions, getGasOptionsLoading])
        //endregion

        return (
            <>
                <div className={classes.options}>
                    {options.map(({ title, content, gasOption }, index) => (
                        <div
                            key={index}
                            onClick={() => setGasOption(gasOption)}
                            className={selectedGasOption === gasOption ? classes.selected : undefined}>
                            <Typography className={classes.optionsTitle}>{title}</Typography>
                            <Typography component="div">
                                {new BigNumber(content?.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                                <Typography variant="inherit">Gwei</Typography>
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
                                        setGasOption(null)
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
                                    .times(inputGasLimit || 1)
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
                                    setGasOption(null)
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
                                    .times(inputGasLimit || 1)
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
                                    setGasOption(null)
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
                    loading={getGasOptionsLoading}
                    variant="contained"
                    fullWidth
                    className={classes.button}
                    disabled={!isEmpty(errors)}
                    onClick={onSubmit}>
                    {t('confirm')}
                </LoadingButton>
            </>
        )
    },
)
