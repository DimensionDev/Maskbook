import { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { Controller, useForm } from 'react-hook-form'
import { formatGweiToEther, formatGweiToWei, useTokenConstants } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import BigNumber from 'bignumber.js'
import { isEmpty, noop } from 'lodash-unified'
// import { StyledInput } from '../../../../extension/popups/components/StyledInput'
import { useI18N } from '../../../../utils'
import { useGasSettingStyles } from './useGasSettingStyles'
import type { GasSettingProps } from './types'
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
} from '@masknet/web3-shared-base'
import { useChainId, useFungibleTokenBalance, useGasOptions } from '@masknet/plugin-infra/web3'

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export const GasSetting1559: FC<GasSettingProps> = memo(
    ({ gasLimit, minGasLimit = 0, gasOptionType = GasOptionType.NORMAL, onConfirm = noop }) => {
        const { t } = useI18N()
        const { classes } = useGasSettingStyles()
        const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
        const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)

        const [selectedGasOption, setGasOptionType] = useState<GasOptionType | null>(gasOptionType)
        const { value: nativeTokenPrice = 0 } = useFungibleTokenBalance(
            NetworkPluginID.PLUGIN_EVM,
            NATIVE_TOKEN_ADDRESS,
            {
                chainId,
            },
        )

        const { value: gasOptions, loading: getGasOptionsLoading } = useGasOptions(NetworkPluginID.PLUGIN_EVM)

        // #region Gas options
        const options = useMemo(
            () => [
                {
                    title: t('popups_wallet_gas_fee_settings_low'),
                    gasOption: GasOptionType.SLOW,
                    content: gasOptions?.options[GasOptionType.SLOW],
                },
                {
                    title: t('popups_wallet_gas_fee_settings_medium'),
                    gasOption: GasOptionType.NORMAL,
                    content: gasOptions?.options[GasOptionType.NORMAL],
                },
                {
                    title: t('popups_wallet_gas_fee_settings_high'),
                    gasOption: GasOptionType.FAST,
                    content: gasOptions?.options[GasOptionType.FAST],
                },
            ],
            [gasOptions],
        )
        // #endregion
        const currentGasOption = options.find((opt) => opt.gasOption === selectedGasOption)

        // #region Form field define schema
        const schema = useMemo(() => {
            return zod
                .object({
                    gasLimit: zod
                        .string()
                        .min(1, t('wallet_transfer_error_gas_limit_absence'))
                        .refine(
                            (gasLimit) => isGreaterThanOrEqualTo(gasLimit, minGasLimit),
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

        // #region Set gas on tx to form data
        useUpdateEffect(() => {
            if (gasLimit) setValue('gasLimit', new BigNumber(gasLimit).toString())
        }, [gasLimit, setValue])
        // #endregion

        // #region If the selected changed, set the value on the option to the form data
        useEffect(() => {
            if (selectedGasOption === null) return
            clearErrors(['maxPriorityFeePerGas', 'maxFeePerGas'])
            setValue(
                'maxPriorityFeePerGas',
                new BigNumber(currentGasOption?.content?.suggestedMaxPriorityFeePerGas ?? 0).toString() ?? '',
            )
            setValue(
                'maxFeePerGas',
                new BigNumber(currentGasOption?.content?.suggestedMaxFeePerGas ?? 0).toString() ?? '',
            )
        }, [currentGasOption, setValue, options])
        // #endregion

        const handleConfirm = useCallback(
            (data: zod.infer<typeof schema>) => {
                onConfirm?.({
                    gasLimit: data.gasLimit,
                    maxFee: formatGweiToWei(data.maxFeePerGas).toFixed(0),
                    priorityFee: formatGweiToWei(data.maxPriorityFeePerGas).toFixed(0),
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

        // #region These are additional form rules that need to be prompted for but do not affect the validation of the form
        const maxPriorFeeHelperText = useMemo(() => {
            if (getGasOptionsLoading) return undefined
            if (
                isLessThan(
                    maxPriorityFeePerGas,
                    gasOptions?.options[GasOptionType.SLOW]?.suggestedMaxPriorityFeePerGas ?? 0,
                )
            )
                return t('wallet_transfer_error_max_priority_gas_fee_too_low')
            if (
                isGreaterThan(
                    maxPriorityFeePerGas,
                    multipliedBy(
                        gasOptions?.options[GasOptionType.FAST]?.suggestedMaxPriorityFeePerGas ?? 0,
                        HIGH_FEE_WARNING_MULTIPLIER,
                    ),
                )
            )
                return t('wallet_transfer_error_max_priority_gas_fee_too_high')
            return undefined
        }, [maxPriorityFeePerGas, gasOptions, getGasOptionsLoading])

        const maxFeeGasHelperText = useMemo(() => {
            if (getGasOptionsLoading) return undefined
            if (isLessThan(maxFeePerGas, gasOptions?.estimatedBaseFee ?? 0))
                return t('wallet_transfer_error_max_fee_too_low')
            if (
                isGreaterThan(
                    maxFeePerGas,
                    multipliedBy(
                        gasOptions?.options[GasOptionType.FAST]?.suggestedMaxFeePerGas ?? 0,
                        HIGH_FEE_WARNING_MULTIPLIER,
                    ),
                )
            )
                return t('wallet_transfer_error_max_fee_too_high')
            return undefined
        }, [maxFeePerGas, gasOptions, getGasOptionsLoading])
        // #endregion

        return (
            <>
                <div className={classes.options}>
                    {options.map(({ title, content, gasOption }, index) => (
                        <div
                            key={index}
                            onClick={() => setGasOptionType(gasOption)}
                            className={selectedGasOption === gasOption ? classes.selected : undefined}>
                            <Typography className={classes.optionsTitle}>{title}</Typography>
                            <Typography component="div">
                                {toFixed(content?.suggestedMaxFeePerGas, 2)}
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
                            return <></>
                            // return (
                            //     <StyledInput
                            //         {...field}
                            //         onChange={(e) => {
                            //             setGasOptionType(null)
                            //             field.onChange(e)
                            //         }}
                            //         error={!!errors.gasLimit?.message}
                            //         helperText={errors.gasLimit?.message}
                            //         inputProps={{
                            //             pattern: '^[0-9]*[.,]?[0-9]*$',
                            //         }}
                            //     />
                            // )
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
                        render={({ field }) => {
                            return <></>
                            // return (
                            //     <StyledInput
                            //         {...field}
                            //         onChange={(e) => {
                            //             setGasOptionType(null)
                            //             field.onChange(e)
                            //         }}
                            //         error={!!errors.maxPriorityFeePerGas?.message || !!maxPriorFeeHelperText}
                            //         helperText={errors.maxPriorityFeePerGas?.message || maxPriorFeeHelperText}
                            //         inputProps={{
                            //             pattern: '^[0-9]*[.,]?[0-9]*$',
                            //         }}
                            //     />
                            // )
                        }}
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
                        render={({ field }) => {
                            return <></>
                            // return (
                            //     <StyledInput
                            //         {...field}
                            //         onChange={(e) => {
                            //             setGasOptionType(null)
                            //             field.onChange(e)
                            //         }}
                            //         error={!!errors.maxFeePerGas?.message || !!maxFeeGasHelperText}
                            //         helperText={errors.maxFeePerGas?.message || maxFeeGasHelperText}
                            //         inputProps={{
                            //             pattern: '^[0-9]*[.,]?[0-9]*$',
                            //         }}
                            //     />
                            // )
                        }}
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
