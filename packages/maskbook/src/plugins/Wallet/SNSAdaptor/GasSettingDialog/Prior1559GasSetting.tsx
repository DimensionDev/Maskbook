import { zodResolver } from '@hookform/resolvers/zod'
import { formatWeiToEther, formatWeiToGwei, useChainId, useNativeTokenDetailed } from '@masknet/web3-shared'
import { Typography } from '@material-ui/core'
import { LoadingButton } from '@material-ui/lab'
import BigNumber from 'bignumber.js'
import { isEmpty } from 'lodash-es'
import { memo, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { z as zod } from 'zod'
import { StyledInput } from '../../../../extension/popups/components/StyledInput'
import { useI18N } from '../../../../utils'
import { WalletRPC } from '../../../Wallet/messages'
import { useNativeTokenPrice } from '../../hooks/useTokenPrice'
import { useGasSettingStyles } from './useGasSettingStyles'

export const Prior1559GasSetting = memo(() => {
    const { classes } = useGasSettingStyles()
    const { t } = useI18N()
    const chainId = useChainId()
    const [selected, setOption] = useState<number | null>(null)
    const { value: nativeToken } = useNativeTokenDetailed()

    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)

    //#region Get gas now from debank
    const { value: gasNow } = useAsync(async () => {
        const response = await WalletRPC.getGasPriceDictFromDeBank(chainId)
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

    const gas = 0
    const minGasLimit = 0

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
        if (gas) setValue('gasLimit', new BigNumber(gas).toString())
    }, [gas, setValue])

    useEffect(() => {
        if (selected !== null) setValue('gasPrice', formatWeiToGwei(options[selected].gasPrice).toString())
    }, [selected, setValue, options])

    const [{ loading }, handleConfirm] = useAsyncFn(async (data: zod.infer<typeof schema>) => {
        // TODO call onConfirm
    }, [])

    const onSubmit = handleSubmit((data) => handleConfirm(data))

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
