import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { z as zod } from 'zod'
import { BigNumber } from 'bignumber.js'
import { isEmpty, noop } from 'lodash-es'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionButton, makeStyles, MaskColorVar } from '@masknet/theme'
import { formatGweiToWei, formatWeiToEther, formatWeiToGwei, useTokenConstants } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { NetworkPluginID } from '@masknet/shared-base'
import type { GasSettingProps } from './types.js'
import {
    formatCurrency,
    GasOptionType,
    isGreaterThanOrEqualTo,
    isLessThanOrEqualTo,
    isPositive,
} from '@masknet/web3-shared-base'
import { useChainContext, useFungibleTokenPrice, useGasOptions } from '@masknet/web3-hooks-base'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    unit: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        flex: 1,
        marginLeft: '0.5em',
    },
    price: {
        fontSize: 12,
        lineHeight: '16px',
        color: MaskColorVar.normalText,
    },
}))

// eslint-disable-next-line react/no-useless-fragment
const emptyRender = () => <></>
export const GasSetting1559 = memo(
    ({ gasLimit, minGasLimit = 0, gasOptionType = GasOptionType.NORMAL, onConfirm = noop }: GasSettingProps) => {
        const { _ } = useLingui()
        const { classes } = useStyles()
        const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
        const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)

        const [selectedGasOption, setGasOptionType] = useState<GasOptionType | undefined>(gasOptionType)
        const { data: nativeTokenPrice = 0 } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, NATIVE_TOKEN_ADDRESS, {
            chainId,
        })

        const { data: gasOptions, isPending: getGasOptionsLoading } = useGasOptions(NetworkPluginID.PLUGIN_EVM, {
            chainId,
        })

        // #region Gas options
        const options = useMemo(
            () => [
                {
                    title: _(msg`Low`),
                    gasOption: GasOptionType.SLOW,
                    content: gasOptions?.[GasOptionType.SLOW],
                },
                {
                    title: _(msg`Medium`),
                    gasOption: GasOptionType.NORMAL,
                    content: gasOptions?.[GasOptionType.NORMAL],
                },
                {
                    title: _(msg`High`),
                    gasOption: GasOptionType.FAST,
                    content: gasOptions?.[GasOptionType.FAST],
                },
            ],
            [gasOptions],
        )
        // #endregion
        const currentGasOption = options.find((opt) => opt.gasOption === selectedGasOption)

        // #region Form field define schema
        const schema = useMemo(() => {
            return zod
                .object({
                    gasLimit: zod
                        .string()
                        .min(1, _(msg`Enter a gas limit`))
                        .refine(
                            (gasLimit) => isGreaterThanOrEqualTo(gasLimit, minGasLimit),
                            _(msg`Gas limit must be at least ${minGasLimit.toFixed()}`),
                        ),
                    maxPriorityFeePerGas: zod
                        .string()
                        .min(1, _(msg`Enter a max priority fee`))
                        .refine(isPositive, _(msg`Max priority fee must be greater than 0 GWEI`)),
                    maxFeePerGas: zod.string().min(1, _(msg`Enter a max fee`)),
                })
                .refine((data) => isLessThanOrEqualTo(data.maxPriorityFeePerGas, data.maxFeePerGas), {
                    message: _(msg`Max fee cannot be lower than max priority fee`),
                    path: ['maxFeePerGas'],
                })
        }, [minGasLimit, gasOptions])
        // #endregion

        const {
            control,
            handleSubmit,
            setValue,
            clearErrors,
            watch,
            formState: { errors },
        } = useForm<zod.infer<typeof schema>>({
            mode: 'onChange',
            resolver: zodResolver(schema),
            defaultValues: {
                gasLimit: new BigNumber(gasLimit ?? 0).toString(),
                maxPriorityFeePerGas: '',
                maxFeePerGas: '0',
            },
            context: {
                minGasLimit,
                gasOptions,
            },
        })

        // #region Set gas on tx to form data
        useUpdateEffect(() => {
            if (gasLimit) setValue('gasLimit', new BigNumber(gasLimit).toString())
        }, [gasLimit, setValue])
        // #endregion

        // #region If the selected changed, set the value on the option to the form data
        useEffect(() => {
            if (selectedGasOption === null) return
            clearErrors(['maxPriorityFeePerGas', 'maxFeePerGas'])
            setValue(
                'maxPriorityFeePerGas',
                new BigNumber(currentGasOption?.content?.suggestedMaxPriorityFeePerGas ?? 0).toString() ?? '',
            )
            setValue(
                'maxFeePerGas',
                new BigNumber(currentGasOption?.content?.suggestedMaxFeePerGas ?? 0).toString() ?? '',
            )
        }, [currentGasOption, setValue, options])
        // #endregion

        const handleConfirm = useCallback(
            (data: zod.infer<typeof schema>) => {
                onConfirm({
                    gasLimit: data.gasLimit as any,
                    maxFee: formatGweiToWei(data.maxFeePerGas).toFixed(0),
                    priorityFee: formatGweiToWei(data.maxPriorityFeePerGas).toFixed(0),
                    gasOption: selectedGasOption,
                })
            },
            [onConfirm, selectedGasOption],
        )

        const onSubmit = handleSubmit(handleConfirm)

        const [maxPriorityFeePerGas, maxFeePerGas, inputGasLimit] = watch([
            'maxPriorityFeePerGas',
            'maxFeePerGas',
            'gasLimit',
        ])

        return (
            <>
                <div className={classes.options}>
                    {options.map(({ title, content, gasOption }, index) => (
                        <div
                            key={index}
                            onClick={() => setGasOptionType(gasOption)}
                            className={selectedGasOption === gasOption ? classes.selected : undefined}>
                            <Typography className={classes.optionsTitle}>{title}</Typography>
                            <Typography component="div">
                                {formatWeiToGwei(content?.suggestedMaxFeePerGas ?? 0).toFixed(2)}
                                <Typography variant="inherit">Gwei</Typography>
                            </Typography>
                            <Typography className={classes.gasUSD}>
                                {' '}
                                ≈{' '}
                                <span>
                                    {formatCurrency(
                                        formatWeiToEther(content?.suggestedMaxFeePerGas ?? 0)
                                            .times(nativeTokenPrice)
                                            .times(gasLimit ?? 21000),
                                        'USD',
                                        { onlyRemainTwoOrZeroDecimal: true },
                                    )}
                                </span>
                            </Typography>
                        </div>
                    ))}
                </div>
                <form onSubmit={onSubmit}>
                    <Typography className={classes.label}>
                        <Trans>Gas Limit</Trans>
                        <Typography component="span" className={classes.price}>
                            {gasLimit?.toString()}
                        </Typography>
                    </Typography>
                    <Controller control={control} render={emptyRender} name="gasLimit" />
                    <Typography className={classes.label}>
                        <Trans>Max priority fee</Trans>
                        <Typography component="span" className={classes.unit}>
                            (<Trans>GWEI</Trans>)
                        </Typography>
                        <Typography component="span" className={classes.price}>
                            {' '}
                            ≈{' '}
                            <span>
                                {formatWeiToEther(Number(maxPriorityFeePerGas))
                                    .times(nativeTokenPrice)
                                    .times(inputGasLimit || 1)
                                    .toFixed(2)}
                            </span>
                        </Typography>
                    </Typography>
                    <Controller control={control} render={emptyRender} name="maxPriorityFeePerGas" />
                    <Typography className={classes.label}>
                        <Trans>Max fee</Trans>
                        <Typography component="span" className={classes.unit}>
                            (<Trans>GWEI</Trans>)
                        </Typography>
                        <Typography component="span" className={classes.price}>
                            {' '}
                            ≈{' '}
                            <span>
                                {formatWeiToEther(Number(maxFeePerGas))
                                    .times(nativeTokenPrice)
                                    .times(inputGasLimit || 1)
                                    .toFixed(2)}
                            </span>
                        </Typography>
                    </Typography>
                    <Controller control={control} render={emptyRender} name="maxFeePerGas" />
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
