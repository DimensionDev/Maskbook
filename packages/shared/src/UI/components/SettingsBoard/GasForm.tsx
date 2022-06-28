import { useEffect, useMemo } from 'react'
import { useUpdateEffect } from 'react-use'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import BigNumber from 'bignumber.js'
import { makeStyles, MaskAlert, MaskColorVar, MaskTextField } from '@masknet/theme'
import { Grid, Typography } from '@mui/material'
import { WarningIcon } from '@masknet/icons'
import { useSharedI18N } from '@masknet/shared'
import type { ChainId, GasOption, Transaction } from '@masknet/web3-shared-evm'
import {
    GasOptionType,
    isGreaterThanOrEqualTo,
    isLessThan,
    isLessThanOrEqualTo,
    isPositive,
    multipliedBy,
    NetworkPluginID,
} from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

function useSchema(chainId: ChainId, transaction: Transaction, gasOptions: Record<GasOptionType, GasOption>) {
    const t = useSharedI18N()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const isEIP1559 = Others?.chainResolver.isSupport(chainId, 'EIP1559')
    return useMemo(() => {
        return zod
            .object({
                gasLimit: zod
                    .string()
                    .min(1, t.gas_settings_error_gas_limit_absence())
                    .refine(
                        (gasLimit) => isGreaterThanOrEqualTo(gasLimit, transaction.gas as string),
                        t.gas_settings_error_min_gas_limit_tips({ limit: transaction.gas as string }),
                    ),
                gasPrice: zod.string().min(isEIP1559 ? 0 : 1, t.gas_settings_error_gas_price_absence()),
                maxPriorityFeePerGas: zod
                    .string()
                    .min(1, t.gas_settings_error_max_priority_fee_absence())
                    .refine(isPositive, t.gas_settings_error_max_priority_gas_fee_positive())
                    .refine((value) => {
                        return isGreaterThanOrEqualTo(value, gasOptions.slow?.suggestedMaxPriorityFeePerGas ?? 0)
                    }, t.gas_settings_error_max_priority_gas_fee_too_low())
                    .refine(
                        (value) =>
                            isLessThan(
                                value,
                                multipliedBy(
                                    gasOptions.fast?.suggestedMaxPriorityFeePerGas ?? 0,
                                    HIGH_FEE_WARNING_MULTIPLIER,
                                ),
                            ),
                        t.gas_settings_error_max_priority_gas_fee_too_high(),
                    ),
                maxFeePerGas: zod
                    .string()
                    .min(1, t.gas_settings_error_max_fee_absence())
                    .refine(
                        (value) => isGreaterThanOrEqualTo(value, gasOptions.slow?.suggestedMaxFeePerGas ?? 0),
                        t.gas_settings_error_max_fee_too_low(),
                    )
                    .refine(
                        (value) =>
                            isLessThan(
                                value,
                                multipliedBy(gasOptions.fast?.suggestedMaxFeePerGas ?? 0, HIGH_FEE_WARNING_MULTIPLIER),
                            ),
                        t.gas_settings_error_max_fee_too_high(),
                    ),
            })
            .refine((data) => isLessThanOrEqualTo(data.maxPriorityFeePerGas, data.maxFeePerGas), {
                message: t.gas_settings_error_max_priority_gas_fee_imbalance(),
                path: ['maxFeePerGas'],
            })
    }, [t, isEIP1559, transaction.gas, gasOptions, Others])
}

const useStyles = makeStyles()((theme) => {
    return {
        unit: {
            color: MaskColorVar.textLight,
        },
        textfield: {
            '& input[type=number]': {
                '-moz-appearance': 'textfield',
            },
            '& input[type=number]::-webkit-outer-spin-button': {
                '-webkit-appearance': 'none',
            },
            '& input[type=number]::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
            },
        },
        caption: {
            color: MaskColorVar.textSecondary,
            fontWeight: 700,
            margin: theme.spacing(1, 0, 1.5),
        },
    }
})

export interface GasFormProps {
    chainId: ChainId
    transaction: Transaction
    gasOptions: Record<GasOptionType, GasOption>
    onChange?: (data?: Partial<zod.infer<ReturnType<typeof useSchema>>>) => void
}

export function GasForm(props: GasFormProps) {
    const { chainId, transaction, gasOptions, onChange } = props
    const t = useSharedI18N()
    const { classes } = useStyles()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const isEIP1559 = Others?.chainResolver.isSupport(chainId, 'EIP1559')

    const schema = useSchema(chainId, transaction, gasOptions)

    const methods = useForm<zod.infer<typeof schema>>({
        shouldUnregister: false,
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            gasLimit: (transaction.gas as string | undefined) ?? '210000',
            gasPrice: (transaction.gasPrice as string | undefined) ?? gasOptions.normal.suggestedMaxFeePerGas,
            maxPriorityFeePerGas:
                (transaction.maxPriorityFeePerGas as string | undefined) ??
                gasOptions.normal.suggestedMaxPriorityFeePerGas,
            maxFeePerGas: (transaction.maxFeePerGas as string | undefined) ?? gasOptions.normal.suggestedMaxFeePerGas,
        },
    })

    const [gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas] = methods.watch([
        'gasLimit',
        'gasPrice',
        'maxFeePerGas',
        'maxPriorityFeePerGas',
    ])

    const error = useMemo(() => {
        return (
            methods.formState.errors.gasLimit?.message ??
            methods.formState.errors.gasPrice?.message ??
            methods.formState.errors.maxFeePerGas?.message ??
            methods.formState.errors.maxPriorityFeePerGas?.message ??
            ''
        )
    }, [
        methods.formState.errors.gasLimit?.message,
        methods.formState.errors.gasPrice?.message,
        methods.formState.errors.maxFeePerGas?.message,
        methods.formState.errors.maxPriorityFeePerGas?.message,
    ])

    // #region set default Max priority gas fee and max fee
    useUpdateEffect(() => {
        if (!gasOptions) return
        methods.setValue('maxFeePerGas', new BigNumber(gasOptions.normal?.suggestedMaxFeePerGas ?? 0).toString())
        methods.setValue(
            'maxPriorityFeePerGas',
            new BigNumber(gasOptions.normal?.suggestedMaxPriorityFeePerGas ?? 0).toString(),
        )
    }, [gasOptions, methods.setValue])
    // #endregion

    useEffect(() => {
        const payload = isEIP1559
            ? {
                  gasLimit,
                  maxFeePerGas,
                  maxPriorityFeePerGas,
              }
            : {
                  gasPrice,
              }
        onChange?.(!error ? payload : undefined)
    }, [error, isEIP1559, gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas])

    return (
        <FormProvider {...methods}>
            <Grid container direction="row" spacing={2}>
                <Grid item xs={isEIP1559 ? 12 : 6}>
                    <Controller
                        render={({ field }) => (
                            <MaskTextField
                                {...field}
                                className={classes.textfield}
                                InputProps={{
                                    type: 'number',
                                }}
                                inputProps={{
                                    pattern: '^[0-9]*[.,]?[0-9]*$',
                                }}
                                value={gasLimit}
                                label={
                                    <Typography className={classes.caption}>
                                        {t.gas_settings_label_gas_limit()}
                                    </Typography>
                                }
                                error={!!methods.formState.errors.gasLimit?.message}
                            />
                        )}
                        name="gasLimit"
                    />
                </Grid>
                {isEIP1559 ? null : (
                    <Grid item xs={6}>
                        <Controller
                            render={({ field }) => (
                                <MaskTextField
                                    {...field}
                                    className={classes.textfield}
                                    InputProps={{
                                        type: 'number',
                                    }}
                                    inputProps={{
                                        pattern: '^[0-9]*[.,]?[0-9]*$',
                                    }}
                                    value={gasPrice}
                                    label={
                                        <Typography className={classes.caption}>
                                            {t.gas_settings_label_gas_price()}
                                        </Typography>
                                    }
                                    error={!!methods.formState.errors.gasPrice?.message}
                                />
                            )}
                            name="gasPrice"
                        />
                    </Grid>
                )}
            </Grid>
            {isEIP1559 ? (
                <Grid container direction="row" spacing={2}>
                    <Grid item xs={6}>
                        <Controller
                            render={({ field }) => (
                                <MaskTextField
                                    {...field}
                                    className={classes.textfield}
                                    InputProps={{
                                        type: 'number',
                                        endAdornment: <Typography className={classes.unit}>Gwei</Typography>,
                                    }}
                                    inputProps={{
                                        pattern: '^[0-9]*[.,]?[0-9]*$',
                                    }}
                                    value={maxPriorityFeePerGas}
                                    label={
                                        <Typography className={classes.caption}>
                                            {t.gas_settings_label_max_priority_fee()}
                                        </Typography>
                                    }
                                    error={!!methods.formState.errors.maxPriorityFeePerGas?.message}
                                />
                            )}
                            name="maxPriorityFeePerGas"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Controller
                            render={({ field }) => (
                                <MaskTextField
                                    {...field}
                                    className={classes.textfield}
                                    InputProps={{
                                        type: 'number',
                                        endAdornment: <Typography className={classes.unit}>Gwei</Typography>,
                                    }}
                                    inputProps={{
                                        pattern: '^[0-9]*[.,]?[0-9]*$',
                                    }}
                                    value={maxFeePerGas}
                                    label={
                                        <Typography className={classes.caption}>
                                            {t.gas_settings_label_max_fee()}
                                        </Typography>
                                    }
                                    error={!!methods.formState.errors.maxFeePerGas?.message}
                                />
                            )}
                            name="maxFeePerGas"
                        />
                    </Grid>
                </Grid>
            ) : null}
            {error ? (
                <MaskAlert icon={<WarningIcon />} severity="error">
                    {error}
                </MaskAlert>
            ) : null}
        </FormProvider>
    )
}
