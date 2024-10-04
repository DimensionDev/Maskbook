import { memo, useEffect, useMemo, useState } from 'react'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { BigNumber } from 'bignumber.js'
import { isEmpty } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { NetworkPluginID, NUMERIC_INPUT_REGEXP_PATTERN, PopupRoutes } from '@masknet/shared-base'
import { Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useChainContext, useGasOptions, useNativeToken, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import {
    ChainId,
    formatGweiToWei,
    formatWeiToGwei,
    type ChainIdOptionalRecord,
    formatWeiToEther,
} from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { EVMWeb3 } from '@masknet/web3-providers'
import { formatCurrency, GasOptionType, isLessThan, pow10, TransactionDescriptorType } from '@masknet/web3-shared-base'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import Services from '#services'
import { FormattedCurrency } from '@masknet/shared'

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
    },
    selected: {
        backgroundColor: theme.palette.primary.main,
        '& > *': {
            color: theme.palette.primary.contrastText,
        },
    },
    button: {
        fontWeight: 600,
        marginTop: 10,
        padding: '9px 10px',
        borderRadius: 20,
    },
    disabled: {
        opacity: 0.5,
        backgroundColor: '#1C68F3!important',
        color: '#ffffff!important',
    },
}))

const minGasPriceOfChain: ChainIdOptionalRecord<BigNumber.Value> = {
    [ChainId.BSC]: pow10(9).multipliedBy(5),
    [ChainId.Conflux]: pow10(9).multipliedBy(5),
    [ChainId.Polygon]: pow10(9).multipliedBy(30),
    [ChainId.Astar]: pow10(9).multipliedBy(5), // 5 Gwei
}

export const Prior1559GasSetting = memo(() => {
    const t = useMaskSharedTrans()
    const { classes } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { data: gasOptions_ } = useGasOptions(NetworkPluginID.PLUGIN_EVM, { chainId })
    const { value, loading: getValueLoading } = useUnconfirmedRequest()
    const navigate = useNavigate()
    const [selected, setOption] = useState<number | null>(null)
    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId: nativeToken?.chainId,
    })

    // #region Get gas options from debank
    const gasOptions = useMemo(() => {
        return {
            slow: gasOptions_?.[GasOptionType.SLOW].suggestedMaxFeePerGas ?? 0,
            standard: gasOptions_?.[GasOptionType.NORMAL].suggestedMaxFeePerGas ?? 0,
            fast: gasOptions_?.[GasOptionType.FAST].suggestedMaxFeePerGas ?? 0,
        }
    }, [chainId, gasOptions_])
    // #endregion

    const options = useMemo(
        () =>
            gasOptions ?
                [
                    {
                        title: t.popups_wallet_gas_fee_settings_low(),
                        gasPrice: gasOptions.slow,
                    },
                    {
                        title: t.popups_wallet_gas_fee_settings_medium(),
                        gasPrice: gasOptions.standard,
                    },
                    {
                        title: t.popups_wallet_gas_fee_settings_high(),
                        gasPrice: gasOptions.fast,
                    },
                ]
            :   null,
        [gasOptions],
    )

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

    const { value: minGasLimit } = useAsync(async () => {
        if (
            value &&
            (value.formatterTransaction?.type === TransactionDescriptorType.TRANSFER ||
                value.formatterTransaction?.type === TransactionDescriptorType.INTERACTION)
        ) {
            try {
                return await (EVMWeb3.estimateTransaction?.(value.formatterTransaction._tx) ?? 0)
            } catch {
                return 0
            }
        }

        return 0
    }, [value])

    const schema = useMemo(() => {
        return zod.object({
            gasLimit: zod
                .string()
                .min(1, t.wallet_transfer_error_gas_limit_absence())
                .refine(
                    (gasLimit) => new BigNumber(gasLimit).gte(minGasLimit ?? 0),
                    t.popups_wallet_gas_fee_settings_min_gas_limit_tips({ limit: String(minGasLimit) }),
                ),
            gasPrice: zod.string().min(1, t.wallet_transfer_error_gas_price_absence()),
        })
    }, [minGasLimit])

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            gasLimit: '',
            gasPrice: '',
        },
        context: {
            minGasLimit,
        },
    })

    useUpdateEffect(() => {
        if (
            value?.formatterTransaction?.type === TransactionDescriptorType.TRANSFER ||
            value?.formatterTransaction?.type === TransactionDescriptorType.INTERACTION
        ) {
            // if rpc payload contain gas price, set it to default values
            if (value.formatterTransaction._tx.gasPrice) {
                const minGasPrice = minGasPriceOfChain[chainId]
                // if the gas price in payload is lower than minimum value
                if (minGasPrice && isLessThan(value.formatterTransaction._tx.gasPrice, minGasPrice)) {
                    setValue('gasPrice', new BigNumber(minGasPrice).toString())
                }
                setValue('gasPrice', formatWeiToGwei(value.formatterTransaction._tx.gasPrice).toString())
            } else {
                setOption(1)
            }
        }
    }, [value, setValue, chainId])

    useUpdateEffect(() => {
        const gasLimit = minGasLimit || gas
        if (gasLimit) setValue('gasLimit', new BigNumber(gasLimit).toString())
    }, [minGasLimit, gas, setValue])

    useEffect(() => {
        if (selected !== null && options) setValue('gasPrice', formatWeiToGwei(options[selected].gasPrice).toString())
    }, [selected, setValue, options])

    const [{ loading }, handleConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            if (!value) return
            const config = value.payload.params!.map((param) => ({
                ...param,
                gas: web3_utils.toHex(new BigNumber(data.gasLimit).toString()),
                gasPrice: web3_utils.toHex(formatGweiToWei(data.gasPrice).toString()),
            }))
            await Services.Wallet.updateUnconfirmedRequest({
                ...value.payload,
                params: config,
            })
            navigate(-1)
        },
        [value],
    )

    const onSubmit = handleSubmit((data) => handleConfirm(data))

    useUpdateEffect(() => {
        if (!value && !getValueLoading) {
            navigate(PopupRoutes.Wallet, { replace: true })
        }
    }, [value, getValueLoading])

    return (
        <>
            {options ?
                <div className={classes.options}>
                    {options.map(({ title, gasPrice }, index) => (
                        <div
                            key={index}
                            onClick={() => setOption(index)}
                            className={selected === index ? classes.selected : undefined}>
                            <Typography className={classes.optionsTitle}>{title}</Typography>
                            <Typography className={classes.optionsContent}>
                                {formatWeiToGwei(gasPrice ?? 0).toString()} Gwei
                            </Typography>
                            <Typography className={classes.gasUSD}>
                                ≈{' '}
                                <FormattedCurrency
                                    value={formatWeiToEther(gasPrice)
                                        .times(nativeTokenPrice)
                                        .times(minGasLimit || 21000)}
                                    formatter={formatCurrency}
                                />
                            </Typography>
                        </div>
                    ))}
                </div>
            :   null}
            <form onSubmit={onSubmit}>
                <Typography className={classes.label}>{t.popups_wallet_gas_fee_settings_gas_limit()}</Typography>
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
                <Typography className={classes.label}>{t.popups_wallet_gas_price()}</Typography>
                <Controller
                    control={control}
                    render={({ field }) => (
                        <StyledInput
                            {...field}
                            onChange={(e) => {
                                setOption(null)
                                field.onChange(e)
                            }}
                            error={!!errors.gasPrice?.message}
                            helperText={errors.gasPrice?.message}
                            InputProps={{
                                inputProps: {
                                    pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                                },
                            }}
                        />
                    )}
                    name="gasPrice"
                />
            </form>
            <LoadingButton
                loading={loading}
                variant="contained"
                fullWidth
                classes={{ root: classes.button, disabled: classes.disabled }}
                disabled={!isEmpty(errors)}
                onClick={onSubmit}>
                {t.confirm()}
            </LoadingButton>
        </>
    )
})
