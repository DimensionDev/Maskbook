import { useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import type { z as zod } from 'zod'
import { BigNumber } from 'bignumber.js'
import { Grid, Typography } from '@mui/material'
import { makeStyles, MaskAlert, MaskTextField } from '@masknet/theme'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icons } from '@masknet/icons'
import { NUMERIC_INPUT_REGEXP_PATTERN } from '@masknet/shared-base'
import {
    type ChainId,
    formatGweiToWei,
    formatWeiToGwei,
    type GasOption,
    type Transaction,
} from '@masknet/web3-shared-evm'
import { formatCurrency, GasOptionType, isPositive, isZero } from '@masknet/web3-shared-base'
import { EVMUtils } from '@masknet/web3-providers'
import { useGasSchema } from './hooks/index.js'
import { Trans } from '@lingui/macro'

function getDefaultValues(transaction: Transaction, gasOptions: Record<GasOptionType, GasOption>) {
    return {
        gasLimit: transaction.gas ?? '21000',
        gasPrice: formatWeiToGwei(transaction.gasPrice || gasOptions.normal.suggestedMaxFeePerGas).toString(),
        maxPriorityFeePerGas: formatWeiToGwei(
            transaction.maxPriorityFeePerGas || gasOptions.normal.suggestedMaxPriorityFeePerGas,
        ).toString(),
        maxFeePerGas: formatWeiToGwei(transaction.maxFeePerGas || gasOptions.normal.suggestedMaxFeePerGas).toString(),
    }
}

const useStyles = makeStyles()((theme) => {
    return {
        unit: {
            color: theme.palette.maskColor.third,
        },
        caption: {
            color: theme.palette.maskColor.second,
            fontWeight: 700,
            margin: theme.spacing(1, 0, 1.5),
        },
        alertIcon: {
            color: `${theme.palette.maskColor.main} !important`,
            width: 22,
            height: 22,
            padding: 0,
        },
        alertMessage: {
            color: theme.palette.maskColor.main,
            fontSize: 14,
            fontWeight: 400,
            padding: 0,
        },
        alertStandardSuccess: {
            backgroundColor: theme.palette.maskColor.bg,
        },
    }
})

interface GasFormProps {
    defaultGasLimit: string
    chainId: ChainId
    transaction: Transaction
    disableGasLimit?: boolean
    transactionOptions: Partial<Transaction>
    gasOptions: Record<GasOptionType, GasOption>
    onChange?: (transactionOptions?: Partial<Transaction>) => void
    maxPriorityFeePerGasByUser?: string
    setMaxPriorityFeePerGasByUser: (s: string) => void
}

export function GasForm(props: GasFormProps) {
    const {
        defaultGasLimit,
        chainId,
        transaction,
        transactionOptions,
        gasOptions,
        onChange,
        maxPriorityFeePerGasByUser,
        setMaxPriorityFeePerGasByUser,
    } = props
    const { classes } = useStyles()

    const isEIP1559 = EVMUtils.chainResolver.isFeatureSupported(chainId, 'EIP1559')
    const baseFeePerGas = gasOptions[GasOptionType.FAST].baseFeePerGas ?? '0'

    const schema = useGasSchema(chainId, transaction, gasOptions)
    const transactionComputed: Transaction = {
        ...transaction,
        ...transactionOptions,
    }

    const methods = useForm<zod.infer<typeof schema>>({
        shouldUnregister: false,
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: getDefaultValues(transactionComputed, gasOptions),
    })

    const { errors } = methods.formState
    const [gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas] = methods.watch([
        'gasLimit',
        'gasPrice',
        'maxFeePerGas',
        'maxPriorityFeePerGas',
    ])

    const [gasPriceByUser, setGasPriceByUser] = useState<string>()
    const [maxFeePerGasByUser, setMaxFeePerGasByUser] = useState<string>()

    const errorCenter = useMemo(() => {
        return isEIP1559 ? errors.gasLimit?.message ?? '' : ''
    }, [isEIP1559, errors.gasLimit?.message])
    const errorBottom = useMemo(() => {
        return (
            (isEIP1559 ? undefined : errors.gasPrice?.message) ??
            (isEIP1559 ? undefined : errors.gasLimit?.message) ??
            (isEIP1559 ? errors.maxFeePerGas?.message : undefined) ??
            (isEIP1559 ? errors.maxPriorityFeePerGas?.message : undefined) ??
            ''
        )
    }, [
        isEIP1559,
        errors.gasPrice?.message,
        errors.gasLimit?.message,
        errors.maxFeePerGas?.message,
        errors.maxPriorityFeePerGas?.message,
    ])

    // #region set the default max priority gas fee and max fee
    useUpdateEffect(() => {
        if (!gasOptions) return

        if (!gasPriceByUser) {
            methods.setValue('gasPrice', formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas).toString())
        }
        if (!maxFeePerGasByUser) {
            methods.setValue('maxFeePerGas', formatWeiToGwei(gasOptions.normal.suggestedMaxFeePerGas).toString())
        }
        if (!maxPriorityFeePerGasByUser) {
            methods.setValue(
                'maxPriorityFeePerGas',
                formatWeiToGwei(gasOptions.normal.suggestedMaxPriorityFeePerGas).toString(),
            )
        }
    }, [gasOptions, gasPriceByUser, maxFeePerGasByUser, maxPriorityFeePerGasByUser, methods.setValue])
    // #endregion

    useEffect(() => {
        const payload =
            isEIP1559 ?
                {
                    gas: gasLimit,
                    maxFeePerGas: formatGweiToWei(maxFeePerGas).toString(),
                    maxPriorityFeePerGas: formatGweiToWei(maxPriorityFeePerGas).toString(),
                }
            :   {
                    gasPrice: formatGweiToWei(gasPrice).toString(),
                }
        onChange?.(!errorCenter && !errorBottom ? payload : undefined)
    }, [errorCenter, errorBottom, isEIP1559, gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas, gasOptions])

    return (
        <FormProvider {...methods}>
            {isEIP1559 && isPositive(baseFeePerGas) ?
                <MaskAlert
                    classes={{
                        icon: classes.alertIcon,
                        message: classes.alertMessage,
                        standardSuccess: classes.alertStandardSuccess,
                    }}
                    icon={<Icons.Info />}>
                    <Trans>Current base fee is {formatCurrency(formatWeiToGwei(baseFeePerGas), '')} Gwei</Trans>
                </MaskAlert>
            :   null}
            <Grid container direction="row" spacing={2}>
                {isEIP1559 ? null : (
                    <Grid item xs={6}>
                        <Controller
                            render={({ field }) => (
                                <MaskTextField
                                    {...field}
                                    InputProps={{
                                        inputProps: {
                                            pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                        },
                                        type: 'number',
                                        endAdornment: (
                                            <Typography className={classes.unit}>
                                                <Trans>Gwei</Trans>
                                            </Typography>
                                        ),
                                    }}
                                    value={isZero(gasPriceByUser ?? 0) ? gasPrice : gasPriceByUser}
                                    label={
                                        <Typography className={classes.caption}>
                                            <Trans>Gas Price</Trans>
                                        </Typography>
                                    }
                                    error={!!errors.gasPrice?.message}
                                    onChange={(ev) => {
                                        setGasPriceByUser(ev.target.value)
                                        methods.setValue('gasPrice', ev.target.value)
                                        methods.trigger()
                                    }}
                                    fullWidth
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
                                InputProps={{
                                    inputProps: {
                                        pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                    },
                                    type: 'number',
                                }}
                                disabled={props.disableGasLimit}
                                value={isZero(gasLimit) ? defaultGasLimit : new BigNumber(gasLimit).toString()}
                                label={
                                    <Typography className={classes.caption}>
                                        <Trans>Gas Limit</Trans>
                                    </Typography>
                                }
                                fullWidth
                                error={!!errors.gasLimit?.message}
                            />
                        )}
                        name="gasLimit"
                    />
                    {errorCenter ?
                        <MaskAlert icon={<Icons.CircleWarning />} severity="error">
                            {errorCenter}
                        </MaskAlert>
                    :   null}
                </Grid>
            </Grid>
            {isEIP1559 ?
                <Grid container direction="row" spacing={2}>
                    <Grid item xs={6}>
                        <Controller
                            render={({ field }) => (
                                <MaskTextField
                                    {...field}
                                    InputProps={{
                                        inputProps: {
                                            pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                        },
                                        type: 'number',
                                        endAdornment: (
                                            <Typography className={classes.unit}>
                                                <Trans>Gwei</Trans>
                                            </Typography>
                                        ),
                                    }}
                                    value={
                                        isZero(maxPriorityFeePerGasByUser ?? 0) ? maxPriorityFeePerGas : (
                                            maxPriorityFeePerGasByUser
                                        )
                                    }
                                    label={
                                        <Typography className={classes.caption}>
                                            <Trans>Max Priority Fee</Trans>
                                        </Typography>
                                    }
                                    error={!!errors.maxPriorityFeePerGas?.message}
                                    onChange={(ev) => {
                                        setMaxPriorityFeePerGasByUser(ev.target.value)
                                        methods.setValue('maxPriorityFeePerGas', ev.target.value)
                                        methods.trigger()
                                    }}
                                    fullWidth
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
                                    InputProps={{
                                        inputProps: {
                                            pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                        },
                                        type: 'number',
                                        endAdornment: (
                                            <Typography className={classes.unit}>
                                                <Trans>Gwei</Trans>
                                            </Typography>
                                        ),
                                    }}
                                    value={isZero(maxFeePerGasByUser ?? 0) ? maxFeePerGas : maxFeePerGasByUser}
                                    label={
                                        <Typography className={classes.caption}>
                                            <Trans>Max Fee</Trans>
                                        </Typography>
                                    }
                                    error={!!errors.maxFeePerGas?.message}
                                    onChange={(ev) => {
                                        setMaxFeePerGasByUser(ev.target.value)
                                        methods.setValue('maxFeePerGas', ev.target.value)
                                        methods.trigger()
                                    }}
                                    fullWidth
                                />
                            )}
                            name="maxFeePerGas"
                        />
                    </Grid>
                </Grid>
            :   null}
            {errorBottom ?
                <MaskAlert icon={<Icons.CircleWarning />} severity="error">
                    {errorBottom}
                </MaskAlert>
            :   null}
        </FormProvider>
    )
}
