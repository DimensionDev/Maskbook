import { zodResolver } from '@hookform/resolvers/zod'
import { formatWeiToEther, formatWeiToGwei, ChainIdOptionalRecord, ChainId } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import BigNumber from 'bignumber.js'
import { isEmpty, noop } from 'lodash-unified'
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useUpdateEffect } from 'react-use'
import { toWei } from 'web3-utils'
import { z as zod } from 'zod'
// import { StyledInput } from '../../../../extension/popups/components/StyledInput'
import { useI18N } from '../../../../utils'
import type { GasSettingProps } from './types'
import { useGasSettingStyles } from './useGasSettingStyles'
import { GasOptionType, NetworkPluginID , scale10 } from '@masknet/web3-shared-base'
import { useChainId, useFungibleToken, useGasOptions, useFungibleTokenPrice } from '@masknet/plugin-infra/web3'

const minGasPriceOfChain: ChainIdOptionalRecord<BigNumber.Value> = {
    [ChainId.BSC]: scale10(5, 9), // 5 Gwei
    [ChainId.Conflux]: scale10(5, 9), // 5 Gwei
    [ChainId.Matic]: scale10(30, 9), // 30 Gwei
    [ChainId.Moonbeam]: scale10(1, 9), // 1 Gwei
}

export const Prior1559GasSetting: FC<GasSettingProps> = memo(
    ({ gasLimit, minGasLimit = 0, gasOptionType = GasOptionType.NORMAL, onConfirm = noop }) => {
        const { classes } = useGasSettingStyles()
        const { t } = useI18N()
        const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
        const [selectedGasOption, setGasOptionType] = useState<GasOptionType | null>(gasOptionType)
        const { value: nativeToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM)

        const { value: nativeTokenPrice = 0 } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, '', {
            chainId: nativeToken?.chainId,
        })

        const { value: gasOptions, loading: getGasOptionsLoading } = useGasOptions(NetworkPluginID.PLUGIN_EVM)

        const options = useMemo(
            () =>
                gasOptions
                    ? [
                          {
                              title: t('popups_wallet_gas_fee_settings_low'),
                              gasOption: GasOptionType.SLOW,
                              gasPrice: gasOptions[GasOptionType.SLOW].suggestedMaxFeePerGas ?? '0',
                          },
                          {
                              title: t('popups_wallet_gas_fee_settings_medium'),
                              gasOption: GasOptionType.NORMAL,
                              gasPrice: gasOptions[GasOptionType.NORMAL].suggestedMaxFeePerGas ?? '0',
                          },
                          {
                              title: t('popups_wallet_gas_fee_settings_high'),
                              gasOption: GasOptionType.FAST,
                              gasPrice: gasOptions[GasOptionType.FAST].suggestedMaxFeePerGas ?? 0,
                          },
                      ]
                    : null,
            [gasOptions],
        )
        const currentGasOption = options ? options.find((opt) => opt.gasOption === selectedGasOption) : null

        const schema = useMemo(() => {
            return zod.object({
                gasLimit: zod
                    .string()
                    .min(1, t('wallet_transfer_error_gas_limit_absence'))
                    .refine(
                        (gasLimit) => new BigNumber(gasLimit).gte(minGasLimit),
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
                gasLimit: new BigNumber(gasLimit ?? 0).toString(),
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
            const minGasPrice = minGasPriceOfChain[chainId]
            if (currentGasOption || minGasPrice) {
                setValue('gasPrice', formatWeiToGwei(currentGasOption?.gasPrice ?? minGasPrice ?? 0).toString())
            }
        }, [currentGasOption, setValue, chainId])

        const handleConfirm = useCallback(
            (data: zod.infer<typeof schema>) => {
                onConfirm({
                    gasLimit: data.gasLimit,
                    gasPrice: toWei(data.gasPrice, 'gwei'),
                    gasOption: selectedGasOption,
                })
            },
            [selectedGasOption],
        )

        const onSubmit = handleSubmit(handleConfirm)

        return (
            <>
                {options ? (
                    <div className={classes.options}>
                        {options.map(({ title, gasPrice, gasOption }, index) => (
                            <div
                                key={gasOption}
                                onClick={() => setGasOptionType(gasOption)}
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
                ) : null}
                <form onSubmit={onSubmit}>
                    <Typography className={classes.label}>{t('popups_wallet_gas_fee_settings_gas_limit')}</Typography>
                    <Controller
                        control={control}
                        render={({ field }) => {
                            return <></>
                            // return (
                            //     <StyledInput
                            //         {...field}
                            //         onChange={(e) => {
                            //             setGasOptionType(null)
                            //             field.onChange(e)
                            //         }}
                            //         error={!!errors.gasLimit?.message}
                            //         helperText={errors.gasLimit?.message}
                            //         inputProps={{
                            //             pattern: '^[0-9]*[.,]?[0-9]*$',
                            //         }}
                            //     />
                            // )
                        }}
                        name="gasLimit"
                    />
                    <Typography className={classes.label}>{t('popups_wallet_gas_price')}</Typography>
                    <Controller
                        control={control}
                        render={({ field }) => {
                            return <></>
                            // return (
                            //     <StyledInput
                            //         {...field}
                            //         onChange={(e) => {
                            //             setGasOptionType(null)
                            //             field.onChange(e)
                            //         }}
                            //         error={!!errors.gasPrice?.message}
                            //         helperText={errors.gasPrice?.message}
                            //         inputProps={{
                            //             pattern: '^[0-9]*[.,]?[0-9]*$',
                            //         }}
                            //     />
                            // )
                        }}
                        name="gasPrice"
                    />
                </form>
                <LoadingButton
                    loading={getGasOptionsLoading}
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
