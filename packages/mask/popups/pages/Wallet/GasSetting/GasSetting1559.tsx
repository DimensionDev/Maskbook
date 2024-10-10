import { memo, useEffect, useMemo, useState } from 'react'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { isEmpty } from 'lodash-es'
import { z as zod } from 'zod'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { BigNumber } from 'bignumber.js'
import { makeStyles } from '@masknet/theme'
import { formatGweiToEther, formatGweiToWei, formatWeiToEther, formatWeiToGwei } from '@masknet/web3-shared-evm'
import { zodResolver } from '@hookform/resolvers/zod'
import { Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { NetworkPluginID, PopupRoutes, NUMERIC_INPUT_REGEXP_PATTERN } from '@masknet/shared-base'
import {
    formatCurrency,
    GasOptionType,
    isGreaterThan,
    isGreaterThanOrEqualTo,
    isLessThan,
    isLessThanOrEqualTo,
    isPositive,
    multipliedBy,
    toFixed,
    TransactionDescriptorType,
} from '@masknet/web3-shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useGasOptions, useNativeToken, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import Services from '#services'
import { FormattedCurrency } from '@masknet/shared'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    optionsContent: {
        fontSize: 11,
    },
    gasUSD: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '14px',
        wordBreak: 'break-all',
    },
    label: {
        color: theme.palette.primary.main,
        fontSize: 12,
        lineHeight: '16px',
        margin: '10px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selected: {
        backgroundColor: theme.palette.primary.main,
        '& > *': {
            color: `${theme.palette.primary.contrastText}!important`,
        },
    },
    button: {
        fontWeight: 600,
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
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
}))

const HIGH_FEE_WARNING_MULTIPLIER = 1.5

export const GasSetting1559 = memo(() => {
    const { _ } = useLingui()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const [selected, setOption] = useState<number | null>(null)
    const [getGasLimitError, setGetGasLimitError] = useState(false)
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId: nativeToken?.chainId,
    })

    const { value, loading: getValueLoading } = useUnconfirmedRequest()
    const { data: gasOptions, isPending: getGasOptionsLoading } = useGasOptions(NetworkPluginID.PLUGIN_EVM, {
        chainId: nativeToken?.chainId,
    })

    // #region Gas options
    const options = useMemo(
        () => [
            {
                title: <Trans>Low</Trans>,
                content: gasOptions?.[GasOptionType.SLOW],
            },
            {
                title: <Trans>Medium</Trans>,
                content: gasOptions?.[GasOptionType.NORMAL],
            },
            {
                title: <Trans>High</Trans>,
                content: gasOptions?.[GasOptionType.FAST],
            },
        ],
        [gasOptions],
    )
    // #endregion

    // #region If the payload type be TRANSFER or INTERACTION, get the gas from the payload
    const gas = useMemo(() => {
        if (
            value &&
            (value.formatterTransaction?.type === TransactionDescriptorType.TRANSFER ||
                value.formatterTransaction?.type === TransactionDescriptorType.INTERACTION)
        ) {
            return new BigNumber(value.formatterTransaction._tx.gas ?? 0).toNumber()
        }
        return 0
    }, [value])
    // #endregion

    // #region If the payload type be TRANSFER or INTERACTION, estimate min gas limit by tx data
    const { value: minGasLimit } = useAsync(async () => {
        if (
            value &&
            (value.formatterTransaction?.type === TransactionDescriptorType.TRANSFER ||
                value.formatterTransaction?.type === TransactionDescriptorType.INTERACTION)
        ) {
            try {
                return await EVMWeb3.estimateTransaction?.({
                    data: value.formatterTransaction._tx.data,
                    from: value.formatterTransaction._tx.from,
                    to: value.formatterTransaction._tx.to,
                    value: value.formatterTransaction._tx.value,
                })
            } catch {
                setGetGasLimitError(true)
                return 0
            }
        }

        return 0
    }, [value])
    // #endregion

    // #region Form field define schema
    const schema = useMemo(() => {
        return zod
            .object({
                gasLimit: zod
                    .string()
                    .min(1, _(msg`Enter a gas limit`))
                    .refine(
                        (gasLimit) => isGreaterThanOrEqualTo(gasLimit, minGasLimit ?? 0),
                        _(msg`Gas limit must be at least ${String(minGasLimit)}`),
                    ),
                maxPriorityFeePerGas: zod
                    .string()
                    .min(1, _(msg`Enter a max priority fee`))
                    .refine(isPositive, _(msg`Max priority fee must be greater than 0 GWEI`)),
                maxFeePerGas: zod.string().min(1, _(msg`Enter a max fee`)),
            })
            .refine((data) => isLessThanOrEqualTo(data.maxPriorityFeePerGas, data.maxFeePerGas), {
                message: _(msg`Max fee cannot be lower than max priority fee`),
                path: ['maxFeePerGas'],
            })
    }, [minGasLimit, gasOptions])
    // #endregion

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
            gasOptions,
        },
    })

    // #region If the payload type be TRANSFER or INTERACTION and there are maxFeePerGas and maxPriorityFeePerGas parameters on tx, set them to the form data
    useUpdateEffect(() => {
        if (
            value?.formatterTransaction?.type === TransactionDescriptorType.TRANSFER ||
            value?.formatterTransaction?.type === TransactionDescriptorType.INTERACTION
        ) {
            if (value.formatterTransaction._tx.maxFeePerGas && value.formatterTransaction._tx.maxPriorityFeePerGas) {
                setValue(
                    'maxPriorityFeePerGas',
                    web3_utils.fromWei(toFixed(value.formatterTransaction._tx.maxPriorityFeePerGas), 'gwei'),
                )
                setValue(
                    'maxFeePerGas',
                    web3_utils.fromWei(toFixed(value.formatterTransaction._tx.maxFeePerGas), 'gwei'),
                )
            } else {
                setOption(1)
            }
        }
    }, [value, setValue])
    // #endregion

    // #region Set gas on tx to form data
    useUpdateEffect(() => {
        if (gas) setValue('gasLimit', new BigNumber(gas).toString())
    }, [gas, setValue])
    // #endregion

    // #region If the selected changed, set the value on the option to the form data
    useEffect(() => {
        if (selected === null) return
        const { content } = options[selected]
        setValue('maxPriorityFeePerGas', formatWeiToGwei(content?.suggestedMaxPriorityFeePerGas ?? 0).toString() ?? '')
        setValue('maxFeePerGas', formatWeiToGwei(content?.suggestedMaxFeePerGas ?? 0).toString() ?? '')
    }, [selected, setValue, options])
    // #endregion

    const [{ loading }, handleConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            if (!value) return
            const config = value.payload.params!.map((param) =>
                param === 'latest' ? param : (
                    {
                        ...param,
                        gas: web3_utils.toHex(new BigNumber(data.gasLimit).toString()),
                        maxPriorityFeePerGas: web3_utils.toHex(formatGweiToWei(data.maxPriorityFeePerGas).toFixed(0)),
                        maxFeePerGas: web3_utils.toHex(formatGweiToWei(data.maxFeePerGas).toFixed(0)),
                    }
                ),
            )

            await Services.Wallet.updateUnconfirmedRequest({
                ...value.payload,
                owner: value.owner,
                identifier: value.identifier?.toText(),
                paymentToken: value.paymentToken,
                params: config,
            })
            navigate(-1)
        },
        [value],
    )

    const onSubmit = handleSubmit((data) => handleConfirm(data))

    const [maxPriorityFeePerGas, maxFeePerGas, gasLimit] = watch(['maxPriorityFeePerGas', 'maxFeePerGas', 'gasLimit'])

    // #region These are additional form rules that need to be prompted for but do not affect the validation of the form
    const maxPriorFeeHelperText = useMemo(() => {
        if (getGasOptionsLoading) return undefined
        if (
            isLessThan(
                formatGweiToWei(maxPriorityFeePerGas),
                gasOptions?.[GasOptionType.SLOW]?.suggestedMaxPriorityFeePerGas ?? 0,
            )
        )
            return <Trans>Max priority fee is too low for network conditions</Trans>
        if (
            isGreaterThan(
                formatGweiToWei(maxPriorityFeePerGas),
                multipliedBy(
                    gasOptions?.[GasOptionType.FAST]?.suggestedMaxPriorityFeePerGas ?? 0,
                    HIGH_FEE_WARNING_MULTIPLIER,
                ),
            )
        )
            return <Trans>Max priority fee is higher than necessary. You may pay more than needed.</Trans>
        return undefined
    }, [maxPriorityFeePerGas, gasOptions, getGasOptionsLoading])

    const maxFeeGasHelperText = useMemo(() => {
        if (getGasOptionsLoading) return undefined
        if (isLessThan(formatGweiToWei(maxFeePerGas), gasOptions?.[GasOptionType.SLOW]?.estimatedBaseFee ?? 0))
            return <Trans>Max fee is too low for network conditions.</Trans>
        if (
            isGreaterThan(
                formatGweiToWei(maxFeePerGas),
                multipliedBy(gasOptions?.[GasOptionType.FAST]?.suggestedMaxFeePerGas ?? 0, HIGH_FEE_WARNING_MULTIPLIER),
            )
        )
            return <Trans>Max fee is higher than necessary</Trans>
        return undefined
    }, [maxFeePerGas, gasOptions, getGasOptionsLoading])
    // #endregion

    // #region If the payload is consumed it needs to be redirected
    useUpdateEffect(() => {
        if (!value && !getValueLoading) {
            navigate(PopupRoutes.Wallet, { replace: true })
        }
    }, [value, getValueLoading])
    // #endregion

    // #region If the estimate gas be 0, Set error
    useUpdateEffect(() => {
        if (getGasLimitError) setError('gasLimit', { message: 'Cant not get estimate gas from contract' })
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
                        <Typography component="div" className={classes.optionsContent}>
                            {formatWeiToGwei(content?.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                            <Typography variant="inherit" component="span">
                                GWEI
                            </Typography>
                        </Typography>
                        <Typography className={classes.gasUSD}>
                            ≈{' '}
                            <FormattedCurrency
                                value={formatWeiToEther(content?.suggestedMaxFeePerGas ?? 0)
                                    .times(nativeTokenPrice)
                                    .times(gasLimit)}
                                formatter={formatCurrency}
                            />
                        </Typography>
                    </div>
                ))}
            </div>
            <form onSubmit={onSubmit}>
                <Typography className={classes.label}>
                    <Trans>Gas Limit</Trans>
                </Typography>
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
                                InputProps={{
                                    inputProps: {
                                        pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                    },
                                }}
                            />
                        )
                    }}
                    name="gasLimit"
                />
                <Typography className={classes.label}>
                    <Trans>Max Priority Fee</Trans>
                    <Typography component="span" className={classes.unit}>
                        (GWEI)
                    </Typography>
                    <Typography component="span" className={classes.price}>
                        ≈{' '}
                        <FormattedCurrency
                            value={formatGweiToEther(Number(maxPriorityFeePerGas))
                                .times(nativeTokenPrice)
                                .times(gasLimit)}
                            formatter={formatCurrency}
                        />
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
                            InputProps={{
                                inputProps: {
                                    pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                },
                            }}
                        />
                    )}
                    name="maxPriorityFeePerGas"
                />
                <Typography className={classes.label}>
                    <Trans>Max Fee</Trans>
                    <Typography component="span" className={classes.unit}>
                        (GWEI)
                    </Typography>
                    <Typography component="span" className={classes.price}>
                        ≈{' '}
                        <FormattedCurrency
                            value={formatGweiToEther(Number(maxFeePerGas)).times(nativeTokenPrice).times(gasLimit)}
                            formatter={formatCurrency}
                        />
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
                            InputProps={{
                                inputProps: {
                                    pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                },
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
                classes={{ root: classes.button, disabled: classes.disabled }}
                disabled={!isEmpty(errors)}
                onClick={onSubmit}>
                <Trans>Confirm</Trans>
            </LoadingButton>
        </>
    )
})
