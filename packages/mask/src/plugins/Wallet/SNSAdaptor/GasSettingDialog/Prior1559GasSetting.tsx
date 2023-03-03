import { type FC, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useUpdateEffect } from 'react-use'
import { isEmpty, noop } from 'lodash-es'
import { toWei } from 'web3-utils'
import { z as zod } from 'zod'
import { BigNumber } from 'bignumber.js'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    formatWeiToGwei,
    type ChainIdOptionalRecord,
    ChainId,
    formatGweiToEther,
    formatWeiToEther,
} from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { useI18N } from '../../../../utils/index.js'
import type { GasSettingProps } from './types.js'
import { GasOptionType, pow10 } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useGasOptions, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { ActionButton, makeStyles, MaskColorVar } from '@masknet/theme'
import { Trans } from 'react-i18next'

const minGasPriceOfChain: ChainIdOptionalRecord<BigNumber.Value> = {
    [ChainId.BSC]: pow10(9).multipliedBy(5),
    [ChainId.Conflux]: pow10(9).multipliedBy(5),
    [ChainId.Matic]: pow10(9).multipliedBy(30),
    [ChainId.Astar]: pow10(9).multipliedBy(5), // 5 Gwei
}

const useStyles = makeStyles()((theme) => ({
    options: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 10,
        cursor: 'pointer',
        width: '100%',
        overflowX: 'scroll',
        '& > *': {
            backgroundColor: theme.palette.mode === 'dark' ? '#212442' : '#f7f9fa',
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
            color: theme.palette.primary.contrastText,
        },
    },
    button: {
        marginTop: 10,
        padding: '9px 10px',
        borderRadius: 20,
    },
    price: {
        fontSize: 12,
        lineHeight: '16px',
        color: MaskColorVar.normalText,
    },
}))

export const Prior1559GasSetting: FC<GasSettingProps> = memo(
    ({ gasLimit, minGasLimit = 0, gasOptionType = GasOptionType.NORMAL, onConfirm = noop }) => {
        const { classes } = useStyles()
        const { t } = useI18N()
        const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
        const [selectedGasOption, setGasOptionType] = useState<GasOptionType | null>(gasOptionType)

        const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM)

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

        const [inputGasLimit, gasPrice] = watch(['gasLimit', 'gasPrice'])

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
                                    <Trans
                                        i18nKey="popups_wallet_gas_fee_settings_usd"
                                        values={{
                                            usd: formatWeiToEther(gasPrice)
                                                .times(nativeTokenPrice)
                                                .times(inputGasLimit || '1')
                                                .toPrecision(3),
                                        }}
                                        components={{ span: <span /> }}
                                        shouldUnescape
                                    />
                                </Typography>
                            </div>
                        ))}
                    </div>
                ) : null}
                <form onSubmit={onSubmit}>
                    <Typography className={classes.label}>
                        {t('popups_wallet_gas_fee_settings_gas_limit')}
                        <Typography component="span" className={classes.price}>
                            {gasLimit?.toString()}
                        </Typography>
                    </Typography>
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
                    <Typography className={classes.label}>
                        {t('popups_wallet_gas_price')}
                        <Typography component="span" className={classes.price}>
                            {t('popups_wallet_gas_fee_settings_usd', {
                                usd: formatGweiToEther(gasPrice ?? 0)
                                    .times(nativeTokenPrice)
                                    .times(inputGasLimit || 1)
                                    .toFixed(2),
                            })}
                        </Typography>
                    </Typography>
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
                <ActionButton
                    loading={getGasOptionsLoading}
                    fullWidth
                    className={classes.button}
                    disabled={!isEmpty(errors)}
                    onClick={onSubmit}>
                    {t('confirm')}
                </ActionButton>
            </>
        )
    },
)
