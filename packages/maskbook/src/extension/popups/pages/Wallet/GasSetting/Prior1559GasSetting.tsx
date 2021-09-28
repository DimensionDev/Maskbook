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
} from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { z as zod } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Typography } from '@material-ui/core'
import { StyledInput } from '../../../components/StyledInput'
import { LoadingButton } from '@material-ui/lab'
import { isEmpty } from 'lodash-es'
import { useHistory } from 'react-router-dom'
import { useNativeTokenPrice } from '../../../../../plugins/Wallet/hooks/useTokenPrice'
import { PopupRoutes } from '../../../index'
import { toHex } from 'web3-utils'

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
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        margin: '10px 0',
    },
    selected: {
        backgroundColor: '#1C68F3',
        '& > *': {
            color: '#ffffff!important',
        },
    },
    button: {
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
    const history = useHistory()
    const [selected, setOption] = useState<number | null>(null)
    const { value: nativeToken } = useNativeTokenDetailed()

    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)

    //#region Get gas now from debank
    const { value: gasNow } = useAsync(async () => {
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
                gasPrice: gasNow?.slow ?? 0,
            },
            {
                title: t('popups_wallet_gas_fee_settings_medium'),
                gasPrice: gasNow?.standard ?? 0,
            },
            {
                title: t('popups_wallet_gas_fee_settings_high'),
                gasPrice: gasNow?.fast ?? 0,
            },
        ],
        [gasNow],
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
            return web3.eth.estimateGas(value.computedPayload._tx)
        }

        return 0
    }, [value, web3])

    const schema = useMemo(() => {
        return zod.object({
            gasLimit: zod
                .string()
                .min(1, t('wallet_transfer_error_gasLimit_absence'))
                .refine(
                    (gasLimit) => new BigNumber(gasLimit).gte(minGasLimit ?? 0),
                    t('popups_wallet_gas_fee_settings_min_gas_limit_tips', { limit: minGasLimit }),
                ),
            gasPrice: zod.string().min(1, t('wallet_transfer_error_gasPrice_absence')),
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
                                usd: formatWeiToEther(gasPrice).times(nativeTokenPrice).toPrecision(3),
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
                loading={loading}
                variant="contained"
                fullWidth
                className={classes.button}
                disabled={!isEmpty(errors)}
                onClick={onSubmit}>
                {t('confirm')}
            </LoadingButton>
        </>
    )
})
