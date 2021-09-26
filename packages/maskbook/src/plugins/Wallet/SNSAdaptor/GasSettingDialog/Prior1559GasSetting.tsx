import { zodResolver } from '@hookform/resolvers/zod'
import { formatWeiToEther, formatWeiToGwei, GasOption, useChainId, useNativeTokenDetailed } from '@masknet/web3-shared'
import { Typography } from '@material-ui/core'
import { LoadingButton } from '@material-ui/lab'
import BigNumber from 'bignumber.js'
import { isEmpty } from 'lodash-es'
import { FC, memo, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { z as zod } from 'zod'
import { StyledInput } from '../../../../extension/popups/components/StyledInput'
import { useI18N } from '../../../../utils'
import { WalletRPC } from '../../../Wallet/messages'
import { useNativeTokenPrice } from '../../hooks/useTokenPrice'
import type { GasSettingProps } from './types'
import { useGasSettingStyles } from './useGasSettingStyles'

export const Prior1559GasSetting: FC<GasSettingProps> = memo(
    ({ gasLimit = 0, gasOption = GasOption.Medium, onConfirm }) => {
        const { classes } = useGasSettingStyles()
        const { t } = useI18N()
        const chainId = useChainId()
        const [selectedGasOption, setGasOption] = useState<GasOption | null>(gasOption)
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
                    gasOption: GasOption.Slow,
                    gasPrice: gasNow?.slow ?? 0,
                },
                {
                    title: t('popups_wallet_gas_fee_settings_medium'),
                    gasOption: GasOption.Medium,
                    gasPrice: gasNow?.standard ?? 0,
                },
                {
                    title: t('popups_wallet_gas_fee_settings_high'),
                    gasOption: GasOption.High,
                    gasPrice: gasNow?.fast ?? 0,
                },
            ],
            [gasNow],
        )
        const currentGasOption = options.find((opt) => opt.gasOption === selectedGasOption)

        const gas = 0
        const minGasLimit = gasLimit

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
                gasLimit: `${gasLimit ?? ''}`,
                gasPrice: '',
            },
            context: {
                minGasLimit,
            },
        })

        useUpdateEffect(() => {
            if (gasLimit) setValue('gasLimit', new BigNumber(gasLimit).toString())
        }, [gasLimit, setValue])

        useEffect(() => {
            if (currentGasOption) {
                setValue('gasPrice', formatWeiToGwei(currentGasOption.gasPrice).toString())
            }
        }, [currentGasOption, setValue])

        const [{ loading }, handleConfirm] = useAsyncFn(async (data: zod.infer<typeof schema>) => {
            // TODO call onConfirm
        }, [])

        const onSubmit = handleSubmit((data) => handleConfirm(data))

        return (
            <>
                <div className={classes.options}>
                    {options.map(({ title, gasPrice, gasOption }, index) => (
                        <div
                            key={gasOption}
                            onClick={() => setGasOption(gasOption)}
                            className={selectedGasOption === gasOption ? classes.selected : undefined}>
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
                                        setGasOption(null)
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
                                    setGasOption(null)
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
    },
)
