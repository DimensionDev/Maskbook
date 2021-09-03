import { memo, useCallback, useMemo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@material-ui/core'
import { useI18N } from '../../../../../utils'
import { currentGasNowSettings } from '../../../../../plugins/Wallet/settings'
import { useValueRef } from '@masknet/shared'
import { EthereumRpcType, formatWeiToGwei, useEtherPrice } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'
import { StyledInput } from '../../../components/StyledInput'
import { z as zod } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { LoadingButton } from '@material-ui/lab'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: 16,
        '& > *': {
            marginTop: 10,
        },
    },
    title: {
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 500,
    },
    description: {
        fontSize: 12,
        lineHeight: '18px',
        color: '#7B8192',
    },
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

const GasSetting = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const gasNow = useValueRef(currentGasNowSettings)
    const etherPrice = useEtherPrice()

    const [currentGasPrice, setCurrentGasPrice] = useState<number | null>(null)

    const { value } = useAsyncRetry(async () => {
        const payload = await WalletRPC.topUnconfirmedRequest()
        if (!payload) return
        const computedPayload = await Services.Ethereum.getJsonRpcComputed(payload)
        return {
            payload,
            computedPayload,
        }
    })

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
        if (value && value.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION) {
            return new BigNumber(value?.computedPayload?._tx.gas ?? 0, 16).toNumber()
        }
        return '0'
    }, [value])

    const handleClickOption = useCallback((option: number) => {
        setCurrentGasPrice((prev) => {
            if (prev === option) return null
            return option
        })
    }, [])

    const schema = useMemo(() => {
        return zod
            .object({
                gas: zod
                    .string()
                    .refine(
                        (data) => new BigNumber(data).isLessThan(gas),
                        t('popups_wallet_gas_fee_settings_limit_lower', { gas }),
                    ),
                maxPriorityFeePerGas: zod.string(),
                maxFeePerGas: zod.string(),
            })
            .refine(
                (data) => {
                    console.log(new BigNumber(data.maxFeePerGas).isGreaterThan(data.maxPriorityFeePerGas))
                    return new BigNumber(data.maxFeePerGas).isGreaterThan(data.maxPriorityFeePerGas)
                },
                {
                    message: t('popups_wallet_gas_fee_settings_maxFee_lower_than_priorityFee'),
                    path: ['maxFeePerGas'],
                },
            )
    }, [value?.computedPayload, gas])

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<zod.infer<typeof schema>>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: {
            gas: new BigNumber(gas).toString(),
            maxPriorityFeePerGas: '0',
            maxFeePerGas: '0',
        },
    })

    const [{ loading }, handleConfirm] = useAsyncFn(
        async (data?: zod.infer<typeof schema>) => {
            if (value) {
                const [initConfig] = value.payload.params[0]

                const config = data
                    ? {
                          ...value.payload.params[0],
                          gas: data.gas,
                          maxPriorityFeePerGas: data?.maxPriorityFeePerGas,
                          maxFeePerGas: data?.maxFeePerGas,
                      }
                    : {
                          ...value.payload.params[0],
                          gas,
                          gasPrice: currentGasPrice ? options[currentGasPrice].gasPrice : initConfig.gasPrice,
                      }
                await WalletRPC.deleteUnconfirmedRequest(value.payload)
                await Services.Ethereum.request({ ...value.payload, params: [config, ...value.payload.params] })
            }
        },
        [value, currentGasPrice, options],
    )

    const onSubmit = handleSubmit((data) => handleConfirm(data))

    return (
        <main className={classes.container}>
            <Typography className={classes.title}>{t('popups_wallet_gas_fee_settings')}</Typography>
            <Typography className={classes.description}>{t('popups_wallet_gas_fee_settings_description')}</Typography>
            <div className={classes.options}>
                {options.map(({ title, gasPrice }, index) => (
                    <div
                        key={index}
                        onClick={() => handleClickOption(index)}
                        className={currentGasPrice === index ? classes.selected : undefined}>
                        <Typography className={classes.optionsTitle}>{title}</Typography>
                        <Typography>{formatWeiToGwei(gasPrice).toString()} Gwei</Typography>
                        <Typography className={classes.gasUSD}>
                            {t('popups_wallet_gas_fee_settings_usd', {
                                usd: new BigNumber(gasPrice)
                                    .div(10 ** 18)
                                    .times(etherPrice)
                                    .toPrecision(3),
                            })}
                        </Typography>
                    </div>
                ))}
            </div>
            <Typography className={classes.or}>{t('popups_wallet_gas_fee_settings_or')}</Typography>
            <form>
                <Typography className={classes.label}>{t('popups_wallet_gas_fee_settings_gas_limit')}</Typography>
                <Controller
                    control={control}
                    render={({ field }) => {
                        return (
                            <StyledInput
                                {...field}
                                value={Number(field.value) ? field.value : gas}
                                error={!!errors.gas?.message}
                                helperText={errors.gas?.message}
                                disabled={currentGasPrice !== null}
                            />
                        )
                    }}
                    name="gas"
                />
                <Typography className={classes.label}>
                    {t('popups_wallet_gas_fee_settings_max_priority_fee')}
                </Typography>
                <Controller
                    control={control}
                    render={({ field }) => (
                        <StyledInput
                            {...field}
                            disabled={currentGasPrice !== null}
                            error={!!errors.maxPriorityFeePerGas?.message}
                            helperText={errors.maxPriorityFeePerGas?.message}
                        />
                    )}
                    name="maxPriorityFeePerGas"
                />
                <Typography className={classes.label}>{t('popups_wallet_gas_fee_settings_max_fee')}</Typography>
                <Controller
                    control={control}
                    render={({ field }) => (
                        <StyledInput
                            {...field}
                            disabled={currentGasPrice !== null}
                            error={!!errors.maxFeePerGas?.message}
                            helperText={errors.maxFeePerGas?.message}
                        />
                    )}
                    name="maxFeePerGas"
                />
            </form>
            <LoadingButton
                loading={loading}
                variant="contained"
                fullWidth
                className={classes.button}
                disabled={!isValid && !currentGasPrice}
                onClick={() => {
                    currentGasPrice ? handleConfirm() : onSubmit()
                }}>
                {t('confirm')}
            </LoadingButton>
        </main>
    )
})

export default GasSetting
