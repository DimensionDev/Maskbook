import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { Controller, useForm } from 'react-hook-form'
import { isEmpty, noop } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
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
import { GasOptionType, pow10 } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useGasOptions, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { ActionButton, makeStyles, MaskColorVar } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { GasSettingProps } from './types.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const minGasPriceOfChain: ChainIdOptionalRecord<BigNumber.Value> = {
    [ChainId.BSC]: pow10(9).multipliedBy(5),
    [ChainId.Conflux]: pow10(9).multipliedBy(5),
    [ChainId.Polygon]: pow10(9).multipliedBy(30),
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

// eslint-disable-next-line react/no-useless-fragment
const emptyRender = () => <></>
export const Prior1559GasSetting = memo(
    ({ gasLimit, minGasLimit = 0, gasOptionType = GasOptionType.NORMAL, onConfirm = noop }: GasSettingProps) => {
        const { _ } = useLingui()
        const { classes } = useStyles()
        const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
        const [selectedGasOption, setGasOptionType] = useState<GasOptionType>(gasOptionType)

        const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM)

        const { data: gasOptions, isPending: getGasOptionsLoading } = useGasOptions(NetworkPluginID.PLUGIN_EVM, {
            chainId,
        })

        const options = useMemo(
            () =>
                gasOptions ?
                    [
                        {
                            title: _(msg`Low`),
                            gasOption: GasOptionType.SLOW,
                            gasPrice: gasOptions[GasOptionType.SLOW].suggestedMaxFeePerGas || '0',
                        },
                        {
                            title: _(msg`Medium`),
                            gasOption: GasOptionType.NORMAL,
                            gasPrice: gasOptions[GasOptionType.NORMAL].suggestedMaxFeePerGas || '0',
                        },
                        {
                            title: _(msg`High`),
                            gasOption: GasOptionType.FAST,
                            gasPrice: gasOptions[GasOptionType.FAST].suggestedMaxFeePerGas || 0,
                        },
                    ]
                :   null,
            [gasOptions],
        )
        const currentGasOption = options ? options.find((opt) => opt.gasOption === selectedGasOption) : null

        const schema = useMemo(() => {
            return zod.object({
                gasLimit: zod
                    .string()
                    .min(1, _(msg`Enter a gas limit`))
                    .refine(
                        (gasLimit) => new BigNumber(gasLimit).gte(minGasLimit),
                        _(msg`Gas limit must be at least ${minGasLimit.toFixed()}`),
                    ),
                gasPrice: zod.string().min(1, _(msg`Enter a gas price`)),
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
                gasLimit: new BigNumber(gasLimit || 0).toString(),
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
                setValue('gasPrice', formatWeiToGwei(currentGasOption?.gasPrice || minGasPrice || 0).toString())
            }
        }, [currentGasOption, setValue, chainId])

        const handleConfirm = useCallback(
            (data: zod.infer<typeof schema>) => {
                onConfirm({
                    gasLimit: data.gasLimit as any,
                    gasPrice: web3_utils.toWei(data.gasPrice, 'gwei'),
                    gasOption: selectedGasOption,
                })
            },
            [selectedGasOption],
        )

        const onSubmit = handleSubmit(handleConfirm)

        return (
            <>
                {options ?
                    <div className={classes.options}>
                        {options.map(({ title, gasPrice, gasOption }) => (
                            <div
                                key={gasOption}
                                onClick={() => setGasOptionType(gasOption)}
                                className={selectedGasOption === gasOption ? classes.selected : undefined}>
                                <Typography className={classes.optionsTitle}>{title}</Typography>
                                <Typography>{formatWeiToGwei(gasPrice || 0).toString()} Gwei</Typography>
                                <Typography className={classes.gasUSD}>
                                    {' '}
                                    ≈{' '}
                                    <span>
                                        {formatWeiToEther(gasPrice)
                                            .times(nativeTokenPrice)
                                            .times(inputGasLimit || '1')
                                            .toPrecision(3)}
                                    </span>
                                </Typography>
                            </div>
                        ))}
                    </div>
                :   null}
                <form onSubmit={onSubmit}>
                    <Typography className={classes.label}>
                        <Trans>Gas Limit</Trans>
                        <Typography component="span" className={classes.price}>
                            {gasLimit?.toString()}
                        </Typography>
                    </Typography>
                    <Controller control={control} render={emptyRender} name="gasLimit" />
                    <Typography className={classes.label}>
                        <Trans>Gas Price</Trans>
                        <Typography component="span" className={classes.price}>
                            {' '}
                            ≈{' '}
                            <span>
                                {formatGweiToEther(gasPrice || 0)
                                    .times(nativeTokenPrice)
                                    .times(inputGasLimit || 1)
                                    .toFixed(2)}
                            </span>
                        </Typography>
                    </Typography>
                    <Controller control={control} render={emptyRender} name="gasPrice" />
                </form>
                <ActionButton
                    loading={getGasOptionsLoading}
                    fullWidth
                    className={classes.button}
                    disabled={!isEmpty(errors)}
                    onClick={onSubmit}>
                    <Trans>Confirm</Trans>
                </ActionButton>
            </>
        )
    },
)
