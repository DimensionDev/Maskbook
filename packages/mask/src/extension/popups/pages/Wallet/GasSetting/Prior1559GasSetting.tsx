import { makeStyles } from '@masknet/theme'
import { memo, useEffect, useMemo, useState } from 'react'
import { useI18N } from '../../../../../utils'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import {
    EthereumRpcType,
    formatGweiToWei,
    formatWeiToEther,
    formatWeiToGwei,
    useChainId,
    useNativeTokenDetailed,
    useWeb3,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { z as zod } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Typography } from '@mui/material'
import { StyledInput } from '../../../components/StyledInput'
import { isEmpty } from 'lodash-unified'
import { useHistory } from 'react-router-dom'
import { useNativeTokenPrice } from '../../../../../plugins/Wallet/hooks/useTokenPrice'
import { PopupRoutes } from '@masknet/shared-base'
import { toHex } from 'web3-utils'
import { LoadingButton } from '@masknet/shared'

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
}))

export const Prior1559GasSetting = memo(() => {
    const { classes } = useStyles()
    const web3 = useWeb3()
    const { t } = useI18N()
    const chainId = useChainId()
    const { value, loading: getValueLoading } = useUnconfirmedRequest()
    const [getGasLimitError, setGetGasLimitError] = useState(false)
    const history = useHistory()
    const [selected, setOption] = useState<number | null>(null)
    const { value: nativeToken } = useNativeTokenDetailed()

    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)

    //#region Get gas options from debank
    const { value: gasOptions } = useAsync(async () => {
        const response = await WalletRPC.getGasPriceDictFromDeBank(chainId)
        if (!response) return { slow: 0, standard: 0, fast: 0 }

        return {
            slow: response.data.slow.price,
            standard: response.data.normal.price,
            fast: response.data.fast.price,
        }
    }, [chainId])
    //#endregion

    const options = useMemo(
        () => [
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
        ],
        [gasOptions],
    )

    const gas = useMemo(() => {
        if (
            value &&
            (value?.computedPayload?.type === EthereumRpcType.SEND_ETHER ||
                value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION)
        ) {
            return new BigNumber(value?.computedPayload?._tx.gas ?? 0).toNumber()
        }
        return 0
    }, [value])

    const { value: minGasLimit } = useAsync(async () => {
        if (
            value &&
            (value?.computedPayload?.type === EthereumRpcType.SEND_ETHER ||
                value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION)
        ) {
            try {
                return web3.eth.estimateGas(value.computedPayload._tx)
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
            value?.computedPayload?.type === EthereumRpcType.SEND_ETHER ||
            value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION
        ) {
            // if rpc payload contain gas price, set it to default values
            if (value?.computedPayload._tx.gasPrice) {
                setValue('gasPrice', formatWeiToGwei(value.computedPayload._tx.gasPrice as number).toString())
            } else {
                setOption(1)
            }
        }
    }, [value, setValue])

    useUpdateEffect(() => {
        if (gas) setValue('gasLimit', new BigNumber(gas).toString())
    }, [gas, setValue])

    useEffect(() => {
        if (selected !== null) setValue('gasPrice', formatWeiToGwei(options[selected].gasPrice).toString())
    }, [selected, setValue, options])

    const [{ loading }, handleConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            if (value) {
                const config = value.payload.params.map((param) => ({
                    ...param,
                    gas: toHex(new BigNumber(data.gasLimit).toString()),
                    gasPrice: toHex(formatGweiToWei(data.gasPrice).toString()),
                }))

                await WalletRPC.updateUnconfirmedRequest({
                    ...value.payload,
                    params: config,
                })
                history.goBack()
            }
        },
        [value],
    )

    const onSubmit = handleSubmit((data) => handleConfirm(data))

    useUpdateEffect(() => {
        if (!value && !getValueLoading) {
            history.replace(PopupRoutes.Wallet)
        }
    }, [value, getValueLoading])

    //#region If the estimate gas be 0, Set error
    useUpdateEffect(() => {
        if (!getGasLimitError) setError('gasLimit', { message: 'Cant not get estimate gas from contract' })
    }, [getGasLimitError])

    return (
        <>
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
                                usd: formatWeiToEther(gasPrice).times(nativeTokenPrice).times(21000).toPrecision(3),
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
                variant="contained"
                fullWidth
                classes={classes.button}
                disabled={!isEmpty(errors)}
                onClick={onSubmit}>
                {t('confirm')}
            </LoadingButton>
        </>
    )
})
