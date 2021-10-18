import { zodResolver } from '@hookform/resolvers/zod'
import {
    formatWeiToEther,
    formatWeiToGwei,
    GasOption,
    useChainId,
    useNativeTokenDetailed,
} from '@masknet/web3-shared-evm'
import { Typography } from '@material-ui/core'
import { LoadingButton } from '@material-ui/lab'
import BigNumber from 'bignumber.js'
import { isEmpty, noop } from 'lodash-es'
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useAsync, useUpdateEffect } from 'react-use'
import { toWei } from 'web3-utils'
import { z as zod } from 'zod'
import { StyledInput } from '../../../../extension/popups/components/StyledInput'
import { useI18N } from '../../../../utils'
import { WalletRPC } from '../../../Wallet/messages'
import { useNativeTokenPrice } from '../../hooks/useTokenPrice'
import type { GasSettingProps } from './types'
import { useGasSettingStyles } from './useGasSettingStyles'

export const Prior1559GasSetting: FC<GasSettingProps> = memo(
    ({ gasLimit, gasOption = GasOption.Medium, onConfirm = noop }) => {
        const { classes } = useGasSettingStyles()
        const { t } = useI18N()
        const chainId = useChainId()
        const [selectedGasOption, setGasOption] = useState<GasOption | null>(gasOption)
        const { value: nativeToken } = useNativeTokenDetailed()

        const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)

        //#region Get gas now from debank
        const { value: gasNow, loading: getGasNowLoading } = useAsync(async () => {
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
                    gasOption: GasOption.Low,
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

        const minGasLimit = gasLimit

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
            setValue,
            watch,
            formState: { errors },
        } = useForm<zod.infer<typeof schema>>({
            mode: 'onChange',
            resolver: zodResolver(schema),
            defaultValues: {
                gasLimit: gasLimit ?? '',
                gasPrice: '',
            },
            context: {
                minGasLimit,
            },
        })

        const [inputGasLimit] = watch(['gasLimit'])

        useUpdateEffect(() => {
            if (gasLimit) setValue('gasLimit', new BigNumber(gasLimit).toString())
        }, [gasLimit, setValue])

        useEffect(() => {
            if (currentGasOption) {
                setValue('gasPrice', formatWeiToGwei(currentGasOption.gasPrice).toString())
            }
        }, [currentGasOption, setValue])

        const handleConfirm = useCallback((data: zod.infer<typeof schema>) => {
            onConfirm({
                gasLimit: data.gasLimit,
                gasPrice: toWei(data.gasPrice, 'gwei'),
            })
        }, [])

        const onSubmit = handleSubmit(handleConfirm)

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
                                    usd: formatWeiToEther(gasPrice)
                                        .times(nativeTokenPrice)
                                        .times(inputGasLimit || '1')
                                        .toPrecision(3),
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
                    loading={getGasNowLoading}
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
