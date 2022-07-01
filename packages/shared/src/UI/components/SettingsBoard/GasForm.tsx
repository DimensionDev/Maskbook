import { useEffect, useMemo } from 'react'
import { useUpdateEffect } from 'react-use'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import BigNumber from 'bignumber.js'
import { makeStyles, MaskAlert, MaskTextField } from '@masknet/theme'
import { Grid, Typography } from '@mui/material'
import { Warning as WarningIcon } from '@masknet/icons'
import { useSharedI18N } from '@masknet/shared'
import { ChainId, formatGweiToWei, formatWeiToGwei, GasOption, Transaction } from '@masknet/web3-shared-evm'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGasSchema } from './hooks'

const useStyles = makeStyles()((theme) => {
    return {
        unit: {
            color: theme.palette.maskColor.third,
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
            color: theme.palette.maskColor.second,
            fontWeight: 700,
            margin: theme.spacing(1, 0, 1.5),
        },
    }
})

export interface GasFormProps {
    chainId: ChainId
    transaction: Transaction
    gasOptions: Record<GasOptionType, GasOption>
    onChange?: (transactionOptions?: Partial<Transaction>) => void
}

export function GasForm(props: GasFormProps) {
    const { chainId, transaction, gasOptions, onChange } = props
    const t = useSharedI18N()
    const { classes } = useStyles()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const isEIP1559 = Others?.chainResolver.isSupport(chainId, 'EIP1559')

    const schema = useGasSchema(chainId, transaction, gasOptions)

    const methods = useForm<zod.infer<typeof schema>>({
        shouldUnregister: false,
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            gasLimit: (transaction.gas as string | undefined) ?? '21000',
            gasPrice: transaction.gasPrice
                ? formatWeiToGwei(transaction.gasPrice as string).toString()
                : gasOptions.normal.suggestedMaxFeePerGas,
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas
                ? formatWeiToGwei(transaction.maxPriorityFeePerGas as string).toString()
                : gasOptions.normal.suggestedMaxPriorityFeePerGas,
            maxFeePerGas: transaction.maxFeePerGas
                ? formatWeiToGwei(transaction.maxFeePerGas as string).toString()
                : gasOptions.normal.suggestedMaxFeePerGas,
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
        methods.setValue(
            'maxFeePerGas',
            new BigNumber(gasOptions[GasOptionType.NORMAL].suggestedMaxFeePerGas ?? 0).toString(),
        )
        methods.setValue(
            'maxPriorityFeePerGas',
            new BigNumber(gasOptions[GasOptionType.NORMAL].suggestedMaxPriorityFeePerGas ?? 0).toString(),
        )
    }, [gasOptions, methods.setValue])
    // #endregion

    useEffect(() => {
        const payload = isEIP1559
            ? {
                  gas: gasLimit,
                  maxFeePerGas: formatGweiToWei(maxFeePerGas).toFixed(),
                  maxPriorityFeePerGas: formatGweiToWei(maxPriorityFeePerGas).toFixed(),
              }
            : {
                  gasPrice: formatGweiToWei(gasPrice).toFixed(),
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
