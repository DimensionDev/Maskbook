import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { makeStyles, MaskAlert, MaskTextField } from '@masknet/theme'
import { Grid, Typography } from '@mui/material'
import { InfoIcon, CircleWarningIcon } from '@masknet/icons'
import { useSharedI18N } from '@masknet/shared'
import { ChainId, formatGweiToWei, formatWeiToGwei, GasOption, Transaction } from '@masknet/web3-shared-evm'
import { formatBalance, GasOptionType, isPositive, isZero, NetworkPluginID, scale10 } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGasSchema } from './hooks'

const useStyles = makeStyles()((theme) => {
    return {
        unit: {
            color: theme.palette.maskColor.third,
            fontSize: 14,
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
            fontSize: 14,
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
    const baseFeePerGas = gasOptions[GasOptionType.FAST].baseFeePerGas ?? '0'

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
    const [gasPriceByUser, setGasPriceByUser] = useState<string>()
    const [maxFeePerGasByUser, setMaxFeePerGasByUser] = useState<string>()
    const [maxPriorityFeePerGasByUser, setMaxPriorityFeePerGasByUser] = useState<string>()

    const errorCenter = useMemo(() => {
        return isEIP1559 ? methods.formState.errors.gasLimit?.message ?? '' : ''
    }, [isEIP1559, methods.formState.errors.gasLimit?.message])
    const errorBottom = useMemo(() => {
        return (
            (isEIP1559 ? undefined : methods.formState.errors.gasPrice?.message) ??
            (isEIP1559 ? undefined : methods.formState.errors.gasLimit?.message) ??
            (isEIP1559 ? methods.formState.errors.maxFeePerGas?.message : undefined) ??
            (isEIP1559 ? methods.formState.errors.maxPriorityFeePerGas?.message : undefined) ??
            ''
        )
    }, [
        isEIP1559,
        methods.formState.errors.gasPrice?.message,
        methods.formState.errors.gasLimit?.message,
        methods.formState.errors.maxFeePerGas?.message,
        methods.formState.errors.maxPriorityFeePerGas?.message,
    ])

    // #region set the default max priority gas fee and max fee
    useUpdateEffect(() => {
        if (!gasOptions) return

        if (!gasPriceByUser) {
            methods.setValue('gasPrice', gasOptions.normal.suggestedMaxFeePerGas)
        }
        if (!maxFeePerGasByUser) {
            methods.setValue('maxFeePerGas', gasOptions.normal.suggestedMaxFeePerGas)
        }
        if (!maxPriorityFeePerGasByUser) {
            methods.setValue('maxPriorityFeePerGas', gasOptions.normal.suggestedMaxPriorityFeePerGas)
        }
    }, [gasOptions, gasPriceByUser, maxFeePerGasByUser, maxPriorityFeePerGasByUser, methods.setValue])
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
        onChange?.(!errorCenter && !errorBottom ? payload : undefined)
    }, [errorCenter, errorBottom, isEIP1559, gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas, gasOptions])

    return (
        <FormProvider {...methods}>
            {isEIP1559 && isPositive(baseFeePerGas) ? (
                <MaskAlert icon={<InfoIcon />} severity="info">
                    {t.gas_settings_info_gas_fee({
                        fee: formatBalance(scale10(baseFeePerGas, 2), 2, 2),
                    })}
                </MaskAlert>
            ) : null}
            <Grid container direction="row" spacing={2}>
                {isEIP1559 ? null : (
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
                                    value={isZero(gasPriceByUser ?? 0) ? gasPrice : gasPriceByUser}
                                    label={
                                        <Typography className={classes.caption}>
                                            {t.gas_settings_label_gas_price()}
                                        </Typography>
                                    }
                                    error={!!methods.formState.errors.gasPrice?.message}
                                    onChange={(ev) => {
                                        setGasPriceByUser(ev.target.value)
                                        methods.setValue('gasPrice', ev.target.value)
                                        methods.trigger()
                                    }}
                                />
                            )}
                            name="gasPrice"
                        />
                    </Grid>
                )}
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
                    {errorCenter ? (
                        <MaskAlert icon={<CircleWarningIcon />} severity="error">
                            {errorCenter}
                        </MaskAlert>
                    ) : null}
                </Grid>
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
                                    value={
                                        isZero(maxPriorityFeePerGasByUser ?? 0)
                                            ? maxPriorityFeePerGas
                                            : maxPriorityFeePerGasByUser
                                    }
                                    label={
                                        <Typography className={classes.caption}>
                                            {t.gas_settings_label_max_priority_fee()}
                                        </Typography>
                                    }
                                    error={!!methods.formState.errors.maxPriorityFeePerGas?.message}
                                    onChange={(ev) => {
                                        setMaxPriorityFeePerGasByUser(ev.target.value)
                                        methods.setValue('maxPriorityFeePerGas', ev.target.value)
                                        methods.trigger()
                                    }}
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
                                    value={isZero(maxFeePerGasByUser ?? 0) ? maxFeePerGas : maxFeePerGasByUser}
                                    label={
                                        <Typography className={classes.caption}>
                                            {t.gas_settings_label_max_fee()}
                                        </Typography>
                                    }
                                    error={!!methods.formState.errors.maxFeePerGas?.message}
                                    onChange={(ev) => {
                                        setMaxFeePerGasByUser(ev.target.value)
                                        methods.setValue('maxFeePerGas', ev.target.value)
                                        methods.trigger()
                                    }}
                                />
                            )}
                            name="maxFeePerGas"
                        />
                    </Grid>
                </Grid>
            ) : null}
            {errorBottom ? (
                <MaskAlert icon={<CircleWarningIcon />} severity="error">
                    {errorBottom}
                </MaskAlert>
            ) : null}
        </FormProvider>
    )
}
