import { makeStyles } from '@masknet/theme'
import { isLessThan, NetworkPluginID, pow10, TransactionDescriptorType } from '@masknet/web3-shared-base'
import { memo, useEffect, useMemo, useState } from 'react'
import { useI18N } from '../../../../../utils'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import {
    ChainId,
    formatGweiToWei,
    formatWeiToEther,
    formatWeiToGwei,
    ChainIdOptionalRecord,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { z as zod } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Typography } from '@mui/material'
import { StyledInput } from '../../../components/StyledInput'
import { LoadingButton } from '@mui/lab'
import { isEmpty } from 'lodash-unified'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { toHex } from 'web3-utils'
import { useChainId, useNativeToken, useNativeTokenPrice, useWeb3 } from '@masknet/plugin-infra/web3'

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
        wordBreak: 'break-all',
    },
    or: {
        display: 'flex',
        justifyContent: 'center',
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
    [ChainId.BSC]: pow10(9).multipliedBy(5), // 5 Gwei
    [ChainId.Conflux]: pow10(9).multipliedBy(5), // 5 Gwei
    [ChainId.Matic]: pow10(9).multipliedBy(30), // 30 Gwei
}

export const Prior1559GasSetting = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { value, loading: getValueLoading } = useUnconfirmedRequest()
    const [getGasLimitError, setGetGasLimitError] = useState(false)
    const navigate = useNavigate()
    const [selected, setOption] = useState<number | null>(null)
    const { value: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, {
        chainId: nativeToken?.chainId,
    })

    // #region Get gas options from debank
    const { value: gasOptions } = useAsync(async () => {
        const response = await WalletRPC.getGasPriceDictFromDeBank(chainId)

        if (!response) return null

        return {
            slow: response.data.slow.price,
            standard: response.data.normal.price,
            fast: response.data.fast.price,
        }
    }, [chainId])
    // #endregion

    const options = useMemo(
        () =>
            gasOptions
                ? [
                      {
                          title: t('popups_wallet_gas_fee_settings_low'),
                          gasPrice: gasOptions?.slow ?? 0,
                      },
                      {
                          title: t('popups_wallet_gas_fee_settings_medium'),
                          gasPrice: gasOptions?.standard ?? 0,
                      },
                      {
                          title: t('popups_wallet_gas_fee_settings_high'),
                          gasPrice: gasOptions?.fast ?? 0,
                      },
                  ]
                : null,
        [gasOptions],
    )

    const gas = useMemo(() => {
        if (
            value &&
            (value?.computedPayload?.type === TransactionDescriptorType.TRANSFER ||
                value?.computedPayload?.type === TransactionDescriptorType.INTERACTION)
        ) {
            return new BigNumber(value?.computedPayload?._tx.gas ?? 0).toNumber()
        }
        return 0
    }, [value])

    const { value: minGasLimit } = useAsync(async () => {
        if (
            value &&
            (value?.computedPayload?.type === TransactionDescriptorType.TRANSFER ||
                value?.computedPayload?.type === TransactionDescriptorType.INTERACTION)
        ) {
            try {
                return web3?.eth.estimateGas(value.computedPayload._tx) ?? 0
            } catch {
                return 0
            }
        }

        return 0
    }, [value, web3])

    const schema = useMemo(() => {
        return zod.object({
            gasLimit: zod
                .string()
                .min(1, t('wallet_transfer_error_gas_limit_absence'))
                .refine(
                    (gasLimit) => new BigNumber(gasLimit).gte(minGasLimit ?? 0),
                    t('popups_wallet_gas_fee_settings_min_gas_limit_tips', { limit: minGasLimit }),
                ),
            gasPrice: zod.string().min(1, t('wallet_transfer_error_gas_price_absence')),
        })
    }, [minGasLimit])

    const {
        control,
        handleSubmit,
        setError,
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
            value?.computedPayload?.type === TransactionDescriptorType.TRANSFER ||
            value?.computedPayload?.type === TransactionDescriptorType.INTERACTION
        ) {
            // if rpc payload contain gas price, set it to default values
            if (value?.computedPayload._tx.gasPrice) {
                const minGasPrice = minGasPriceOfChain[chainId]
                // if the gas price in payload is lower than minimum value
                if (minGasPrice && isLessThan(value.computedPayload._tx.gasPrice as number, minGasPrice)) {
                    setValue('gasPrice', formatWeiToGwei(minGasPrice).toString())
                }
                setValue('gasPrice', formatWeiToGwei(value.computedPayload._tx.gasPrice as number).toString())
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
                gas: toHex(new BigNumber(data.gasLimit).toString()),
                gasPrice: toHex(formatGweiToWei(data.gasPrice).toString()),
            }))
            await WalletRPC.updateUnconfirmedRequest({
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

    // #region If the estimate gas be 0, Set error
    useUpdateEffect(() => {
        if (!getGasLimitError) setError('gasLimit', { message: 'Cant not get estimate gas from contract' })
    }, [getGasLimitError])

    return (
        <>
            {options ? (
                <div className={classes.options}>
                    {options.map(({ title, gasPrice }, index) => (
                        <div
                            key={index}
                            onClick={() => setOption(index)}
                            className={selected === index ? classes.selected : undefined}>
                            <Typography className={classes.optionsTitle}>{title}</Typography>
                            <Typography>{formatWeiToGwei(gasPrice ?? 0).toString()} Gwei</Typography>
                            <Typography className={classes.gasUSD}>
                                {t('popups_wallet_gas_fee_settings_usd', {
                                    usd: formatWeiToEther(gasPrice)
                                        .times(nativeTokenPrice)
                                        .times(minGasLimit || 21000)
                                        .toPrecision(3),
                                })}
                            </Typography>
                        </div>
                    ))}
                </div>
            ) : null}
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
                <Typography className={classes.label}>{t('popups_wallet_gas_price')}</Typography>
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
                            inputProps={{
                                pattern: '^[0-9]*[.,]?[0-9]*$',
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
                {t('confirm')}
            </LoadingButton>
        </>
    )
})
