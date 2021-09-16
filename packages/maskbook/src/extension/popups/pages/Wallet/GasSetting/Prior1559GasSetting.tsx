import { memo, useEffect, useMemo } from 'react'
import { useI18N } from '../../../../../utils'
import { useAsyncFn, useUpdateEffect } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import { EthereumRpcType, formatWeiToGwei, useNativeTokenDetailed, GasOption } from '@masknet/web3-shared'
import BigNumber from 'bignumber.js'
import { z as zod } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Typography } from '@material-ui/core'
import { LoadingButton } from '@material-ui/lab'
import { isEmpty, noop } from 'lodash-es'
import { StyledInput } from '../../../components/StyledInput'
import { useNativeTokenPrice } from '../../../../../plugins/Wallet/hooks/useTokenPrice'
import { useStyles } from './useGasSettingStyles'
import { useGasOptions } from './useGasOptions'
import type { GasSettingProps } from './types'

export const Prior1559GasSetting = memo<GasSettingProps>(
    ({ onConfirm, gasOption: selectedGasOption, onGasOptionChange = noop }) => {
        const { classes } = useStyles()
        const { t } = useI18N()
        const { value } = useUnconfirmedRequest()
        const { value: nativeToken } = useNativeTokenDetailed()

        const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)
        const { options } = useGasOptions()
        const gas = useMemo(() => {
            if (
                value &&
                (value.computedPayload?.type === EthereumRpcType.SEND_ETHER ||
                    value.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION)
            ) {
                return new BigNumber(value.computedPayload?._tx.gas ?? 0).toNumber()
            }
            return 0
        }, [value])

        const schema = useMemo(() => {
            return zod.object({
                gasLimit: zod
                    .string()
                    .min(1, t('wallet_transfer_error_gasLimit_absence'))
                    .refine((gasLimit) => new BigNumber(gasLimit).gte(gas), `Gas limit must be at least ${gas}.`),
                gasPrice: zod.string().min(1, t('wallet_transfer_error_gasPrice_absence')),
            })
        }, [gas])

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
                gas,
            },
        })

        useUpdateEffect(() => {
            if (
                value?.computedPayload?.type === EthereumRpcType.SEND_ETHER ||
                value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION
            ) {
                // if rpc payload contain gas price, set it to default values
                if (value?.computedPayload._tx.gasPrice) {
                    setValue('gasPrice', new BigNumber(value.computedPayload._tx.gasPrice as number, 16).toString())
                } else {
                    onGasOptionChange(GasOption.Medium)
                }
            }
        }, [value, setValue])

        const gasPrice: number = useMemo(() => {
            const selectedOption = options.find((opt) => opt.gasOption === selectedGasOption)
            if (selectedOption) {
                return selectedOption.gasPrice ?? 0
            }
            return 0
        }, [options, selectedGasOption])

        useUpdateEffect(() => {
            if (gas) setValue('gasLimit', new BigNumber(gas).toString())
        }, [gas, setValue])

        useEffect(() => {
            setValue('gasPrice', formatWeiToGwei(gasPrice).toString())
        }, [setValue, gasPrice])

        const [{ loading }, handleConfirm] = useAsyncFn(
            async (data: zod.infer<typeof schema>) => {
                if (value) {
                    const config = {
                        ...value.payload.params[0],
                        gas: data.gasLimit,
                        gasPrice: new BigNumber(data.gasPrice).toString(16),
                    }

                    await WalletRPC.deleteUnconfirmedRequest(value.payload)
                    await Services.Ethereum.confirmRequest({
                        ...value.payload,
                        params: [config, ...value.payload.params],
                    })
                    onConfirm?.({ gasPrice, gasLimit: gas })
                }
            },
            [value, onConfirm, gasPrice, gas],
        )

        const onSubmit = handleSubmit((data) => handleConfirm(data))

        return (
            <>
                <div className={classes.options}>
                    {options.map(({ title, gasPrice, gasOption }, index) => (
                        <div
                            key={index}
                            onClick={() => onGasOptionChange(gasOption)}
                            className={selectedGasOption === gasOption ? classes.selected : undefined}>
                            <Typography className={classes.optionsTitle}>{title}</Typography>
                            <Typography>{formatWeiToGwei(gasPrice ?? 0).toFixed(2)} Gwei</Typography>
                            <Typography className={classes.gasUSD}>
                                {t('popups_wallet_gas_fee_settings_usd', {
                                    usd: new BigNumber(gasPrice)
                                        .div(10 ** 18)
                                        .times(nativeTokenPrice)
                                        .toPrecision(3),
                                })}
                            </Typography>
                        </div>
                    ))}
                </div>
                <Typography className={classes.or}>{t('popups_wallet_gas_fee_settings_or')}</Typography>
                <form onSubmit={onSubmit}>
                    <Typography className={classes.label}>{t('popups_wallet_gas_fee_settings_gas_limit')}</Typography>
                    <Controller
                        control={control}
                        render={({ field }) => {
                            return (
                                <StyledInput
                                    {...field}
                                    error={!!errors.gasLimit?.message}
                                    helperText={errors.gasLimit?.message}
                                    inputProps={{
                                        pattern: '^[0-9]*[.,]?[0-9]*$',
                                        type: 'number',
                                    }}
                                />
                            )
                        }}
                        name="gasLimit"
                    />
                    <Typography className={classes.label}>Gas Price</Typography>
                    <Controller
                        control={control}
                        render={({ field }) => (
                            <StyledInput
                                {...field}
                                error={!!errors.gasPrice?.message}
                                helperText={errors.gasPrice?.message}
                                inputProps={{
                                    pattern: '^[0-9]*[.,]?[0-9]*$',
                                    type: 'number',
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
